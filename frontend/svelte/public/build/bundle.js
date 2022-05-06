
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\adminFeaturettes.svelte generated by Svelte v3.24.1 */

    const file = "src\\adminFeaturettes.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	child_ctx[30] = i;
    	return child_ctx;
    }

    // (1:0) <script>   export let admTemplates;     let getAllFeaturettes = async () => {    let response = await fetch("http://localhost:5000/adminGetAllFeaturettes", { method: "POST" }
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>   export let admTemplates;     let getAllFeaturettes = async () => {    let response = await fetch(\\\"http://localhost:5000/adminGetAllFeaturettes\\\", { method: \\\"POST\\\" }",
    		ctx
    	});

    	return block;
    }

    // (136:48)       <div class="container d-flex justify-content-start gap-2 align-items-center mb-3 col-sm-10 col-md-8 mx-auto">       <!-- svelte-ignore a11y-no-onchange -->       <select class="form-select-sm col-4" bind:value={currentID}
    function create_then_block(ctx) {
    	let div0;
    	let select0;
    	let t0;
    	let button0;
    	let span0;
    	let t2;
    	let button1;
    	let span1;
    	let t4;
    	let div1;
    	let label0;
    	let t6;
    	let input0;
    	let t7;
    	let label1;
    	let t9;
    	let input1;
    	let t10;
    	let label2;
    	let t12;
    	let textarea;
    	let t13;
    	let label3;
    	let t15;
    	let select1;
    	let t16;
    	let button2;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*featurettesData*/ ctx[7];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*featuretteImages*/ ctx[6];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			button0 = element("button");
    			span0 = element("span");
    			span0.textContent = "+";
    			t2 = space();
    			button1 = element("button");
    			span1 = element("span");
    			span1.textContent = "×";
    			t4 = space();
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Tytuł";
    			t6 = space();
    			input0 = element("input");
    			t7 = space();
    			label1 = element("label");
    			label1.textContent = "Podtytuł";
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			label2 = element("label");
    			label2.textContent = "Treść";
    			t12 = space();
    			textarea = element("textarea");
    			t13 = space();
    			label3 = element("label");
    			label3.textContent = "Obrazek";
    			t15 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t16 = space();
    			button2 = element("button");
    			button2.textContent = "Zapisz";
    			attr_dev(select0, "class", "form-select-sm col-4");
    			if (/*currentID*/ ctx[0] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[14].call(select0));
    			add_location(select0, file, 138, 5, 3697);
    			attr_dev(span0, "class", "fw-bold");
    			add_location(span0, file, 145, 68, 4035);
    			attr_dev(button0, "class", "btn btn-sm btn-primary px-3");
    			add_location(button0, file, 145, 5, 3972);
    			attr_dev(span1, "class", "fw-bold");
    			add_location(span1, file, 146, 81, 4158);
    			attr_dev(button1, "class", "btn btn-sm btn-outline-danger px-3");
    			add_location(button1, file, 146, 5, 4082);
    			attr_dev(div0, "class", "container d-flex justify-content-start gap-2 align-items-center mb-3 col-sm-10 col-md-8 mx-auto");
    			add_location(div0, file, 136, 4, 3535);
    			attr_dev(label0, "for", "featuretteTitle");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file, 149, 5, 4273);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "featuretteTitle");
    			add_location(input0, file, 150, 5, 4341);
    			attr_dev(label1, "for", "featuretteSubtitle");
    			attr_dev(label1, "class", "form-label mt-3");
    			add_location(label1, file, 152, 5, 4432);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "featuretteSubtitle");
    			add_location(input1, file, 153, 5, 4511);
    			attr_dev(label2, "for", "featuretteContent");
    			attr_dev(label2, "class", "form-label mt-3");
    			add_location(label2, file, 155, 5, 4608);
    			attr_dev(textarea, "type", "text");
    			attr_dev(textarea, "class", "form-control");
    			attr_dev(textarea, "id", "featuretteContent");
    			add_location(textarea, file, 156, 5, 4683);
    			attr_dev(label3, "for", "featuretteImagePath");
    			attr_dev(label3, "class", "form-label mt-3");
    			add_location(label3, file, 158, 5, 4781);
    			attr_dev(select1, "class", "form-control form-select");
    			if (/*imagePath*/ ctx[4] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[18].call(select1));
    			add_location(select1, file, 159, 5, 4860);
    			attr_dev(button2, "class", "btn btn-primary mt-4");
    			add_location(button2, file, 165, 5, 5052);
    			attr_dev(div1, "class", "container col-sm-10 col-md-8 mx-auto");
    			add_location(div1, file, 148, 4, 4216);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*currentID*/ ctx[0]);
    			append_dev(div0, t0);
    			append_dev(div0, button0);
    			append_dev(button0, span0);
    			append_dev(div0, t2);
    			append_dev(div0, button1);
    			append_dev(button1, span1);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label0);
    			append_dev(div1, t6);
    			append_dev(div1, input0);
    			set_input_value(input0, /*title*/ ctx[1]);
    			append_dev(div1, t7);
    			append_dev(div1, label1);
    			append_dev(div1, t9);
    			append_dev(div1, input1);
    			set_input_value(input1, /*subtitle*/ ctx[2]);
    			append_dev(div1, t10);
    			append_dev(div1, label2);
    			append_dev(div1, t12);
    			append_dev(div1, textarea);
    			set_input_value(textarea, /*content*/ ctx[3]);
    			append_dev(div1, t13);
    			append_dev(div1, label3);
    			append_dev(div1, t15);
    			append_dev(div1, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*imagePath*/ ctx[4]);
    			append_dev(div1, t16);
    			append_dev(div1, button2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[14]),
    					listen_dev(select0, "change", /*changeData*/ ctx[8], false, false, false),
    					listen_dev(button0, "click", /*addNew*/ ctx[9], false, false, false),
    					listen_dev(button1, "click", /*deleteRecord*/ ctx[11], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[15]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[16]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[17]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[18]),
    					listen_dev(button2, "click", /*saveRecord*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*featurettesData*/ 128) {
    				each_value_2 = /*featurettesData*/ ctx[7];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*currentID*/ 1) {
    				select_option(select0, /*currentID*/ ctx[0]);
    			}

    			if (dirty & /*title*/ 2 && input0.value !== /*title*/ ctx[1]) {
    				set_input_value(input0, /*title*/ ctx[1]);
    			}

    			if (dirty & /*subtitle*/ 4 && input1.value !== /*subtitle*/ ctx[2]) {
    				set_input_value(input1, /*subtitle*/ ctx[2]);
    			}

    			if (dirty & /*content*/ 8) {
    				set_input_value(textarea, /*content*/ ctx[3]);
    			}

    			if (dirty & /*featuretteImages*/ 64) {
    				each_value_1 = /*featuretteImages*/ ctx[6];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*imagePath, featuretteImages*/ 80) {
    				select_option(select1, /*imagePath*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(136:48)       <div class=\\\"container d-flex justify-content-start gap-2 align-items-center mb-3 col-sm-10 col-md-8 mx-auto\\\">       <!-- svelte-ignore a11y-no-onchange -->       <select class=\\\"form-select-sm col-4\\\" bind:value={currentID}",
    		ctx
    	});

    	return block;
    }

    // (140:6) {#each featurettesData as featurette, idx}
    function create_each_block_2(ctx) {
    	let option;

    	let t0_value = (/*featurette*/ ctx[28][0] == 0
    	? "*NOWY*"
    	: /*featurette*/ ctx[28][0]) + "";

    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*idx*/ ctx[30];
    			option.value = option.__value;
    			add_location(option, file, 140, 7, 3839);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*featurettesData*/ 128 && t0_value !== (t0_value = (/*featurette*/ ctx[28][0] == 0
    			? "*NOWY*"
    			: /*featurette*/ ctx[28][0]) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(140:6) {#each featurettesData as featurette, idx}",
    		ctx
    	});

    	return block;
    }

    // (161:6) {#each featuretteImages as image}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*image*/ ctx[23] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*image*/ ctx[23];
    			option.value = option.__value;
    			add_location(option, file, 161, 7, 4974);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*featuretteImages*/ 64 && t_value !== (t_value = /*image*/ ctx[23] + "")) set_data_dev(t, t_value);

    			if (dirty & /*featuretteImages*/ 64 && option_value_value !== (option_value_value = /*image*/ ctx[23])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(161:6) {#each featuretteImages as image}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let admTemplates;     let getAllFeaturettes = async () => {    let response = await fetch("http://localhost:5000/adminGetAllFeaturettes", { method: "POST" }
    function create_pending_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script>   export let admTemplates;     let getAllFeaturettes = async () => {    let response = await fetch(\\\"http://localhost:5000/adminGetAllFeaturettes\\\", { method: \\\"POST\\\" }",
    		ctx
    	});

    	return block;
    }

    // (187:6) {#each featuretteImages as image}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*image*/ ctx[23] + "";
    	let t0;
    	let t1;
    	let td1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			img = element("img");
    			t2 = space();
    			attr_dev(td0, "class", "text-center fw-bold");
    			add_location(td0, file, 188, 8, 5845);
    			attr_dev(img, "class", "img-preview");
    			if (img.src !== (img_src_value = `http://localhost:5000/uploads/featurettes/${/*image*/ ctx[23]}`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*image*/ ctx[23]);
    			add_location(img, file, 190, 9, 5938);
    			attr_dev(td1, "class", "text-start lh-1");
    			add_location(td1, file, 189, 8, 5899);
    			add_location(tr, file, 187, 7, 5831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, img);
    			append_dev(tr, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*featuretteImages*/ 64 && t0_value !== (t0_value = /*image*/ ctx[23] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*featuretteImages*/ 64 && img.src !== (img_src_value = `http://localhost:5000/uploads/featurettes/${/*image*/ ctx[23]}`)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*featuretteImages*/ 64 && img_alt_value !== (img_alt_value = /*image*/ ctx[23])) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(187:6) {#each featuretteImages as image}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div5;
    	let nav;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let div4;
    	let div0;
    	let p0;
    	let t5;
    	let promise;
    	let t6;
    	let div3;
    	let p1;
    	let t8;
    	let div1;
    	let input;
    	let t9;
    	let button;
    	let t11;
    	let div2;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t13;
    	let th1;
    	let t15;
    	let tbody;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 7
    	};

    	handle_promise(promise = /*featurettesData*/ ctx[7], info);
    	let each_value = /*featuretteImages*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "Featurettes";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Upload";
    			t3 = space();
    			div4 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Featurettes";
    			t5 = space();
    			info.block.c();
    			t6 = space();
    			div3 = element("div");
    			p1 = element("p");
    			p1.textContent = "Upload";
    			t8 = space();
    			div1 = element("div");
    			input = element("input");
    			t9 = space();
    			button = element("button");
    			button.textContent = "Wgraj";
    			t11 = space();
    			div2 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Nazwa";
    			t13 = space();
    			th1 = element("th");
    			th1.textContent = "Podgląd";
    			t15 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(a0, "href", "#featurettes-composition");
    			attr_dev(a0, "class", "nav-link active");
    			attr_dev(a0, "data-bs-toggle", "tab");
    			add_location(a0, file, 129, 2, 3154);
    			attr_dev(a1, "href", "#featurettes-images");
    			attr_dev(a1, "class", "nav-link");
    			attr_dev(a1, "data-bs-toggle", "tab");
    			add_location(a1, file, 130, 2, 3253);
    			attr_dev(nav, "class", "nav nav-pills justify-content-start flex-column flex-md-row mb-3 mx-3");
    			add_location(nav, file, 128, 1, 3067);
    			attr_dev(p0, "class", "h1 mb-3");
    			add_location(p0, file, 134, 3, 3445);
    			attr_dev(div0, "class", "tab-pane container active");
    			attr_dev(div0, "id", "featurettes-composition");
    			add_location(div0, file, 133, 2, 3372);
    			attr_dev(p1, "class", "h1");
    			add_location(p1, file, 170, 3, 5228);
    			attr_dev(input, "name", "file");
    			attr_dev(input, "type", "file");
    			input.multiple = true;
    			attr_dev(input, "accept", "image/*");
    			attr_dev(input, "class", "form-control mt-4");
    			add_location(input, file, 173, 4, 5294);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-success mt-3");
    			add_location(button, file, 174, 4, 5410);
    			attr_dev(div1, "class", "container col-6");
    			add_location(div1, file, 172, 3, 5259);
    			attr_dev(th0, "class", "text-center");
    			attr_dev(th0, "scope", "col");
    			add_location(th0, file, 181, 7, 5637);
    			attr_dev(th1, "class", "text-start");
    			attr_dev(th1, "scope", "col");
    			add_location(th1, file, 182, 7, 5692);
    			add_location(tr, file, 180, 6, 5624);
    			add_location(thead, file, 179, 5, 5609);
    			add_location(tbody, file, 185, 5, 5774);
    			attr_dev(table, "class", "table table-striped");
    			add_location(table, file, 178, 4, 5567);
    			attr_dev(div2, "class", "container col-8 mt-4");
    			add_location(div2, file, 177, 3, 5527);
    			attr_dev(div3, "class", "tab-pane container");
    			attr_dev(div3, "id", "featurettes-images");
    			add_location(div3, file, 169, 2, 5167);
    			attr_dev(div4, "class", "tab-content");
    			add_location(div4, file, 132, 1, 3343);
    			attr_dev(div5, "class", "tab-pane container");
    			attr_dev(div5, "id", "featurettes");
    			add_location(div5, file, 127, 0, 3015);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, nav);
    			append_dev(nav, a0);
    			append_dev(nav, t1);
    			append_dev(nav, a1);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t5);
    			info.block.m(div0, info.anchor = null);
    			info.mount = () => div0;
    			info.anchor = null;
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, p1);
    			append_dev(div3, t8);
    			append_dev(div3, div1);
    			append_dev(div1, input);
    			append_dev(div1, t9);
    			append_dev(div1, button);
    			append_dev(div3, t11);
    			append_dev(div3, div2);
    			append_dev(div2, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t13);
    			append_dev(tr, th1);
    			append_dev(table, t15);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[19]),
    					listen_dev(button, "click", /*uploadFeaturetteImages*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*featurettesData*/ 128 && promise !== (promise = /*featurettesData*/ ctx[7]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[7] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if (dirty & /*featuretteImages*/ 64) {
    				each_value = /*featuretteImages*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			info.block.d();
    			info.token = null;
    			info = null;
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { admTemplates } = $$props;

    	let getAllFeaturettes = async () => {
    		let response = await fetch("http://localhost:5000/adminGetAllFeaturettes", { method: "POST" });
    		let responseJSON = await response.json();
    		return await responseJSON;
    	};

    	let currentID = 0;
    	let featurettesData = [];
    	let title = "";
    	let subtitle = "";
    	let content = "";
    	let imagePath = "";
    	let uploadFiles = [];
    	let featuretteImages = [];

    	const getFeaturettesImages = () => {
    		fetch("http://localhost:5000/adminGetFeaturetteImages", { method: "POST" }).then(response => response.json()).then(data => {
    			$$invalidate(6, featuretteImages = data);
    		});
    	};

    	const getData = () => {
    		getFeaturettesImages();

    		getAllFeaturettes().then(data => {
    			$$invalidate(7, featurettesData = data);
    			changeData();
    		});
    	};

    	const changeData = () => {
    		if (featurettesData.length > 0) {
    			$$invalidate(1, title = featurettesData[currentID][1]);
    			$$invalidate(2, subtitle = featurettesData[currentID][2]);
    			$$invalidate(3, content = featurettesData[currentID][3]);
    			$$invalidate(4, imagePath = featurettesData[currentID][4]);
    		} else {
    			$$invalidate(1, [title, subtitle, content, imagePath] = ["", "", "", ""], title, $$invalidate(2, subtitle), $$invalidate(3, content), $$invalidate(4, imagePath));
    		}
    	};

    	const addNew = () => {
    		$$invalidate(7, featurettesData = [...featurettesData, [0, "", "", "", ""]]);
    		$$invalidate(0, currentID = featurettesData.length - 1);
    		changeData();
    	};

    	const saveRecord = () => {
    		if (featurettesData.length == 0) return;

    		fetch("http://localhost:5000/adminSaveFeaturette", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				id: featurettesData[currentID][0],
    				title,
    				subtitle,
    				content,
    				imagePath
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    				admTemplates.getData();
    			}
    		});
    	};

    	const deleteRecord = () => {
    		if (featurettesData.length == 0) return;

    		if (featurettesData[currentID][0] == 0) {
    			$$invalidate(7, featurettesData = featurettesData.filter((elem, idx) => {
    				return idx != currentID;
    			}));

    			$$invalidate(0, currentID = featurettesData.length - 1);
    			changeData();
    		} else {
    			fetch("http://localhost:5000/adminDeleteFeaturette", {
    				method: "POST",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify({ id: featurettesData[currentID][0] })
    			}).then(response => response.json()).then(data => {
    				if (data.state == "valid") {
    					getData();
    					$$invalidate(0, currentID = featurettesData.length - 2);
    					admTemplates.getData();
    				}
    			});
    		}
    	};

    	const uploadFeaturetteImages = () => {
    		if (uploadFiles.length == 0) return;

    		for (let file of uploadFiles) {
    			let formData = new FormData();
    			formData.append("file", file);

    			fetch("http://localhost:5000/adminUploadFeaturetteImages", { method: "POST", body: formData }).then(response => response.json()).then(() => {
    				getData();
    			});
    		}

    		$$invalidate(5, uploadFiles = []);
    	};

    	getData();
    	const writable_props = ["admTemplates"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AdminFeaturettes> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AdminFeaturettes", $$slots, []);

    	function select0_change_handler() {
    		currentID = select_value(this);
    		$$invalidate(0, currentID);
    	}

    	function input0_input_handler() {
    		title = this.value;
    		$$invalidate(1, title);
    	}

    	function input1_input_handler() {
    		subtitle = this.value;
    		$$invalidate(2, subtitle);
    	}

    	function textarea_input_handler() {
    		content = this.value;
    		$$invalidate(3, content);
    	}

    	function select1_change_handler() {
    		imagePath = select_value(this);
    		$$invalidate(4, imagePath);
    		$$invalidate(6, featuretteImages);
    	}

    	function input_change_handler() {
    		uploadFiles = this.files;
    		$$invalidate(5, uploadFiles);
    	}

    	$$self.$$set = $$props => {
    		if ("admTemplates" in $$props) $$invalidate(13, admTemplates = $$props.admTemplates);
    	};

    	$$self.$capture_state = () => ({
    		admTemplates,
    		getAllFeaturettes,
    		currentID,
    		featurettesData,
    		title,
    		subtitle,
    		content,
    		imagePath,
    		uploadFiles,
    		featuretteImages,
    		getFeaturettesImages,
    		getData,
    		changeData,
    		addNew,
    		saveRecord,
    		deleteRecord,
    		uploadFeaturetteImages
    	});

    	$$self.$inject_state = $$props => {
    		if ("admTemplates" in $$props) $$invalidate(13, admTemplates = $$props.admTemplates);
    		if ("getAllFeaturettes" in $$props) getAllFeaturettes = $$props.getAllFeaturettes;
    		if ("currentID" in $$props) $$invalidate(0, currentID = $$props.currentID);
    		if ("featurettesData" in $$props) $$invalidate(7, featurettesData = $$props.featurettesData);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("subtitle" in $$props) $$invalidate(2, subtitle = $$props.subtitle);
    		if ("content" in $$props) $$invalidate(3, content = $$props.content);
    		if ("imagePath" in $$props) $$invalidate(4, imagePath = $$props.imagePath);
    		if ("uploadFiles" in $$props) $$invalidate(5, uploadFiles = $$props.uploadFiles);
    		if ("featuretteImages" in $$props) $$invalidate(6, featuretteImages = $$props.featuretteImages);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		currentID,
    		title,
    		subtitle,
    		content,
    		imagePath,
    		uploadFiles,
    		featuretteImages,
    		featurettesData,
    		changeData,
    		addNew,
    		saveRecord,
    		deleteRecord,
    		uploadFeaturetteImages,
    		admTemplates,
    		select0_change_handler,
    		input0_input_handler,
    		input1_input_handler,
    		textarea_input_handler,
    		select1_change_handler,
    		input_change_handler
    	];
    }

    class AdminFeaturettes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { admTemplates: 13 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AdminFeaturettes",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*admTemplates*/ ctx[13] === undefined && !("admTemplates" in props)) {
    			console.warn("<AdminFeaturettes> was created without expected prop 'admTemplates'");
    		}
    	}

    	get admTemplates() {
    		throw new Error("<AdminFeaturettes>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set admTemplates(value) {
    		throw new Error("<AdminFeaturettes>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\adminArticles.svelte generated by Svelte v3.24.1 */

    const file$1 = "src\\adminArticles.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	child_ctx[33] = i;
    	return child_ctx;
    }

    // (130:3) {#each articlesData as article, idx}
    function create_each_block_2$1(ctx) {
    	let option;

    	let t0_value = (/*article*/ ctx[31][0] == 0
    	? "*NOWY*"
    	: `${/*article*/ ctx[31][0]} - ${/*article*/ ctx[31][1]}`) + "";

    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*idx*/ ctx[33];
    			option.value = option.__value;
    			add_location(option, file$1, 130, 4, 3440);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*articlesData*/ 2 && t0_value !== (t0_value = (/*article*/ ctx[31][0] == 0
    			? "*NOWY*"
    			: `${/*article*/ ctx[31][0]} - ${/*article*/ ctx[31][1]}`) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(130:3) {#each articlesData as article, idx}",
    		ctx
    	});

    	return block;
    }

    // (153:3) {#each galleries as gallery}
    function create_each_block_1$1(ctx) {
    	let option;
    	let t0_value = /*gallery*/ ctx[28][0] + "";
    	let t0;
    	let t1;
    	let t2_value = /*gallery*/ ctx[28][1] + "";
    	let t2;
    	let t3;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    			t3 = space();
    			option.__value = option_value_value = /*gallery*/ ctx[28][0];
    			option.value = option.__value;
    			add_location(option, file$1, 153, 4, 4684);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    			append_dev(option, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*galleries*/ 8 && t0_value !== (t0_value = /*gallery*/ ctx[28][0] + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*galleries*/ 8 && t2_value !== (t2_value = /*gallery*/ ctx[28][1] + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*galleries*/ 8 && option_value_value !== (option_value_value = /*gallery*/ ctx[28][0])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(153:3) {#each galleries as gallery}",
    		ctx
    	});

    	return block;
    }

    // (164:3) {#each categories as category}
    function create_each_block$1(ctx) {
    	let option;
    	let t0_value = /*category*/ ctx[25][0] + "";
    	let t0;
    	let t1;
    	let t2_value = /*category*/ ctx[25][1] + "";
    	let t2;
    	let t3;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    			t3 = space();
    			option.__value = option_value_value = /*category*/ ctx[25][0];
    			option.value = option.__value;
    			add_location(option, file$1, 164, 4, 5052);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    			append_dev(option, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*categories*/ 4 && t0_value !== (t0_value = /*category*/ ctx[25][0] + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*categories*/ 4 && t2_value !== (t2_value = /*category*/ ctx[25][1] + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*categories*/ 4 && option_value_value !== (option_value_value = /*category*/ ctx[25][0])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(164:3) {#each categories as category}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let p;
    	let t1;
    	let div0;
    	let select0;
    	let t2;
    	let button0;
    	let span0;
    	let t4;
    	let button1;
    	let span1;
    	let t6;
    	let div1;
    	let label0;
    	let t8;
    	let input0;
    	let t9;
    	let label1;
    	let t11;
    	let input1;
    	let t12;
    	let label2;
    	let t14;
    	let textarea;
    	let t15;
    	let label3;
    	let t17;
    	let br0;
    	let t18;
    	let select1;
    	let option0;
    	let option0_value_value;
    	let t20;
    	let label4;
    	let t22;
    	let br1;
    	let t23;
    	let select2;
    	let option1;
    	let option1_value_value;
    	let t25;
    	let button2;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*articlesData*/ ctx[1];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*galleries*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*categories*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			p = element("p");
    			p.textContent = "Articles";
    			t1 = space();
    			div0 = element("div");
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t2 = space();
    			button0 = element("button");
    			span0 = element("span");
    			span0.textContent = "+";
    			t4 = space();
    			button1 = element("button");
    			span1 = element("span");
    			span1.textContent = "×";
    			t6 = space();
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Tytuł";
    			t8 = space();
    			input0 = element("input");
    			t9 = space();
    			label1 = element("label");
    			label1.textContent = "Podtytuł";
    			t11 = space();
    			input1 = element("input");
    			t12 = space();
    			label2 = element("label");
    			label2.textContent = "Treść (<tab> - wcięcie, <nl> - przejście do nowej linii)";
    			t14 = space();
    			textarea = element("textarea");
    			t15 = space();
    			label3 = element("label");
    			label3.textContent = "Powiązana galeria";
    			t17 = space();
    			br0 = element("br");
    			t18 = space();
    			select1 = element("select");
    			option0 = element("option");
    			option0.textContent = "*BRAK* ";

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t20 = space();
    			label4 = element("label");
    			label4.textContent = "Kategoria";
    			t22 = space();
    			br1 = element("br");
    			t23 = space();
    			select2 = element("select");
    			option1 = element("option");
    			option1.textContent = "*BRAK* ";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t25 = space();
    			button2 = element("button");
    			button2.textContent = "Zapisz";
    			attr_dev(p, "class", "h1 mb-3");
    			add_location(p, file$1, 124, 1, 3118);
    			attr_dev(select0, "class", "form-select-sm col-8");
    			if (/*currentID*/ ctx[0] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[15].call(select0));
    			add_location(select0, file$1, 128, 2, 3310);
    			attr_dev(span0, "class", "fw-bold");
    			add_location(span0, file$1, 135, 65, 3636);
    			attr_dev(button0, "class", "btn btn-sm btn-primary px-3");
    			add_location(button0, file$1, 135, 2, 3573);
    			attr_dev(span1, "class", "fw-bold");
    			add_location(span1, file$1, 136, 78, 3756);
    			attr_dev(button1, "class", "btn btn-sm btn-outline-danger px-3");
    			add_location(button1, file$1, 136, 2, 3680);
    			attr_dev(div0, "class", "container d-flex justify-content-start gap-2 align-items-center mb-3 col-sm-10 col-md-8 mx-auto");
    			add_location(div0, file$1, 126, 1, 3154);
    			attr_dev(label0, "for", "articleTitle");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$1, 139, 2, 3862);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "articleTitle");
    			add_location(input0, file$1, 140, 2, 3924);
    			attr_dev(label1, "for", "articleSubtitle");
    			attr_dev(label1, "class", "form-label mt-2");
    			add_location(label1, file$1, 142, 2, 4009);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "articleSubtitle");
    			add_location(input1, file$1, 143, 2, 4082);
    			attr_dev(label2, "for", "articleContent");
    			attr_dev(label2, "class", "form-label mt-2");
    			add_location(label2, file$1, 145, 2, 4173);
    			attr_dev(textarea, "type", "text");
    			attr_dev(textarea, "class", "form-control");
    			attr_dev(textarea, "id", "articleContent");
    			add_location(textarea, file$1, 146, 2, 4305);
    			attr_dev(label3, "for", "articleConnnectedGallery");
    			attr_dev(label3, "class", "form-label mt-2");
    			add_location(label3, file$1, 148, 2, 4397);
    			add_location(br0, file$1, 149, 2, 4488);
    			option0.__value = option0_value_value = 0;
    			option0.value = option0.__value;
    			add_location(option0, file$1, 151, 3, 4610);
    			attr_dev(select1, "id", "articleConnnectedGallery");
    			attr_dev(select1, "class", "form-control form-select col-5");
    			if (/*connectedGallery*/ ctx[7] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[19].call(select1));
    			add_location(select1, file$1, 150, 2, 4498);
    			attr_dev(label4, "for", "articleCategoryID");
    			attr_dev(label4, "class", "form-label mt-2");
    			add_location(label4, file$1, 159, 2, 4791);
    			add_location(br1, file$1, 160, 2, 4867);
    			option1.__value = option1_value_value = 0;
    			option1.value = option1.__value;
    			add_location(option1, file$1, 162, 3, 4976);
    			attr_dev(select2, "id", "articleCategoryID");
    			attr_dev(select2, "class", "form-control form-select col-5");
    			if (/*categoryID*/ ctx[8] === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[20].call(select2));
    			add_location(select2, file$1, 161, 2, 4877);
    			attr_dev(button2, "class", "btn btn-primary mt-4");
    			add_location(button2, file$1, 170, 2, 5162);
    			attr_dev(div1, "class", "container col-sm-10 col-md-8 mx-auto");
    			add_location(div1, file$1, 138, 1, 3808);
    			attr_dev(div2, "class", "tab-pane container");
    			attr_dev(div2, "id", "articles");
    			add_location(div2, file$1, 123, 0, 3069);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, p);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, select0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(select0, null);
    			}

    			select_option(select0, /*currentID*/ ctx[0]);
    			append_dev(div0, t2);
    			append_dev(div0, button0);
    			append_dev(button0, span0);
    			append_dev(div0, t4);
    			append_dev(div0, button1);
    			append_dev(button1, span1);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t8);
    			append_dev(div1, input0);
    			set_input_value(input0, /*title*/ ctx[4]);
    			append_dev(div1, t9);
    			append_dev(div1, label1);
    			append_dev(div1, t11);
    			append_dev(div1, input1);
    			set_input_value(input1, /*subtitle*/ ctx[5]);
    			append_dev(div1, t12);
    			append_dev(div1, label2);
    			append_dev(div1, t14);
    			append_dev(div1, textarea);
    			set_input_value(textarea, /*content*/ ctx[6]);
    			append_dev(div1, t15);
    			append_dev(div1, label3);
    			append_dev(div1, t17);
    			append_dev(div1, br0);
    			append_dev(div1, t18);
    			append_dev(div1, select1);
    			append_dev(select1, option0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select1, null);
    			}

    			select_option(select1, /*connectedGallery*/ ctx[7]);
    			append_dev(div1, t20);
    			append_dev(div1, label4);
    			append_dev(div1, t22);
    			append_dev(div1, br1);
    			append_dev(div1, t23);
    			append_dev(div1, select2);
    			append_dev(select2, option1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select2, null);
    			}

    			select_option(select2, /*categoryID*/ ctx[8]);
    			append_dev(div1, t25);
    			append_dev(div1, button2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[15]),
    					listen_dev(select0, "change", /*changeData*/ ctx[9], false, false, false),
    					listen_dev(button0, "click", /*addNew*/ ctx[10], false, false, false),
    					listen_dev(button1, "click", /*deleteRecord*/ ctx[12], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[16]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[17]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[18]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[19]),
    					listen_dev(select2, "change", /*select2_change_handler*/ ctx[20]),
    					listen_dev(button2, "click", /*saveRecord*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*articlesData*/ 2) {
    				each_value_2 = /*articlesData*/ ctx[1];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty[0] & /*currentID*/ 1) {
    				select_option(select0, /*currentID*/ ctx[0]);
    			}

    			if (dirty[0] & /*title*/ 16 && input0.value !== /*title*/ ctx[4]) {
    				set_input_value(input0, /*title*/ ctx[4]);
    			}

    			if (dirty[0] & /*subtitle*/ 32 && input1.value !== /*subtitle*/ ctx[5]) {
    				set_input_value(input1, /*subtitle*/ ctx[5]);
    			}

    			if (dirty[0] & /*content*/ 64) {
    				set_input_value(textarea, /*content*/ ctx[6]);
    			}

    			if (dirty[0] & /*galleries*/ 8) {
    				each_value_1 = /*galleries*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*connectedGallery, galleries*/ 136) {
    				select_option(select1, /*connectedGallery*/ ctx[7]);
    			}

    			if (dirty[0] & /*categories*/ 4) {
    				each_value = /*categories*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*categoryID, categories*/ 260) {
    				select_option(select2, /*categoryID*/ ctx[8]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { admLinks } = $$props;

    	let getAllArticles = async () => {
    		let response = await fetch("http://localhost:5000/adminGetAllArticles", { method: "POST" });
    		let responseJSON = await response.json();
    		return await responseJSON;
    	};

    	let currentID = 0;
    	let articlesData = [];
    	let categories = [];
    	let galleries = [];
    	let title = "";
    	let subtitle = "";
    	let content = "";
    	let connectedGallery = 0;
    	let categoryID = 0;

    	const getData = () => {
    		getAllArticles().then(data => {
    			$$invalidate(1, articlesData = data);
    			changeData();
    		});
    	};

    	const getCategories = () => {
    		fetch("http://localhost:5000/adminGetAllCategories", { method: "POST" }).then(response => response.json()).then(data => {
    			$$invalidate(2, categories = data);
    		});
    	};

    	const getGalleries = () => {
    		fetch("http://localhost:5000/adminGetAllGalleries", { method: "POST" }).then(response => response.json()).then(data => {
    			$$invalidate(3, galleries = data);
    		});
    	};

    	const changeData = () => {
    		if (articlesData.length > 0) {
    			$$invalidate(4, title = articlesData[currentID][1]);
    			$$invalidate(5, subtitle = articlesData[currentID][2]);
    			$$invalidate(6, content = articlesData[currentID][3].replace("&nbsp;&nbsp;&nbsp;", "<tab>").replace("</br>", "\n<nl>"));
    			$$invalidate(7, connectedGallery = articlesData[currentID][6]);
    			$$invalidate(8, categoryID = articlesData[currentID][7]);
    		} else {
    			$$invalidate(4, [title, subtitle, content, connectedGallery, categoryID] = ["", "", "", 0, 0], title, $$invalidate(5, subtitle), $$invalidate(6, content), $$invalidate(7, connectedGallery), $$invalidate(8, categoryID));
    		}
    	};

    	const addNew = () => {
    		$$invalidate(1, articlesData = [...articlesData, [0, "", "", "", "", "", 0, 0]]);
    		$$invalidate(0, currentID = articlesData.length - 1);
    		changeData();
    		admLinks.init();
    	};

    	const saveRecord = () => {
    		if (articlesData.length == 0) return;

    		fetch("http://localhost:5000/adminSaveArticle", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				id: articlesData[currentID][0],
    				title,
    				subtitle,
    				content: content.replace("<tab>", "&nbsp;&nbsp;&nbsp;").replace("\n<nl>", "</br>"),
    				connectedGallery,
    				categoryID
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    				admLinks.init();
    			}
    		});
    	};

    	const deleteRecord = () => {
    		if (articlesData.length == 0) return;

    		if (articlesData[currentID][0] == 0) {
    			$$invalidate(1, articlesData = articlesData.filter((elem, idx) => {
    				return idx != currentID;
    			}));

    			$$invalidate(0, currentID = articlesData.length - 1);
    			changeData();
    		} else {
    			fetch("http://localhost:5000/adminDeleteArticle", {
    				method: "POST",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify({ id: articlesData[currentID][0] })
    			}).then(response => response.json()).then(data => {
    				if (data.state == "valid") {
    					getData();
    					$$invalidate(0, currentID = articlesData.length - 2);
    					admLinks.init();
    				}
    			});
    		}
    	};

    	const init = () => {
    		getData();
    		getCategories();
    		getGalleries();
    	};

    	init();
    	const writable_props = ["admLinks"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AdminArticles> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AdminArticles", $$slots, []);

    	function select0_change_handler() {
    		currentID = select_value(this);
    		$$invalidate(0, currentID);
    	}

    	function input0_input_handler() {
    		title = this.value;
    		$$invalidate(4, title);
    	}

    	function input1_input_handler() {
    		subtitle = this.value;
    		$$invalidate(5, subtitle);
    	}

    	function textarea_input_handler() {
    		content = this.value;
    		$$invalidate(6, content);
    	}

    	function select1_change_handler() {
    		connectedGallery = select_value(this);
    		$$invalidate(7, connectedGallery);
    		$$invalidate(3, galleries);
    	}

    	function select2_change_handler() {
    		categoryID = select_value(this);
    		$$invalidate(8, categoryID);
    		$$invalidate(2, categories);
    	}

    	$$self.$$set = $$props => {
    		if ("admLinks" in $$props) $$invalidate(13, admLinks = $$props.admLinks);
    	};

    	$$self.$capture_state = () => ({
    		admLinks,
    		getAllArticles,
    		currentID,
    		articlesData,
    		categories,
    		galleries,
    		title,
    		subtitle,
    		content,
    		connectedGallery,
    		categoryID,
    		getData,
    		getCategories,
    		getGalleries,
    		changeData,
    		addNew,
    		saveRecord,
    		deleteRecord,
    		init
    	});

    	$$self.$inject_state = $$props => {
    		if ("admLinks" in $$props) $$invalidate(13, admLinks = $$props.admLinks);
    		if ("getAllArticles" in $$props) getAllArticles = $$props.getAllArticles;
    		if ("currentID" in $$props) $$invalidate(0, currentID = $$props.currentID);
    		if ("articlesData" in $$props) $$invalidate(1, articlesData = $$props.articlesData);
    		if ("categories" in $$props) $$invalidate(2, categories = $$props.categories);
    		if ("galleries" in $$props) $$invalidate(3, galleries = $$props.galleries);
    		if ("title" in $$props) $$invalidate(4, title = $$props.title);
    		if ("subtitle" in $$props) $$invalidate(5, subtitle = $$props.subtitle);
    		if ("content" in $$props) $$invalidate(6, content = $$props.content);
    		if ("connectedGallery" in $$props) $$invalidate(7, connectedGallery = $$props.connectedGallery);
    		if ("categoryID" in $$props) $$invalidate(8, categoryID = $$props.categoryID);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		currentID,
    		articlesData,
    		categories,
    		galleries,
    		title,
    		subtitle,
    		content,
    		connectedGallery,
    		categoryID,
    		changeData,
    		addNew,
    		saveRecord,
    		deleteRecord,
    		admLinks,
    		init,
    		select0_change_handler,
    		input0_input_handler,
    		input1_input_handler,
    		textarea_input_handler,
    		select1_change_handler,
    		select2_change_handler
    	];
    }

    class AdminArticles extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { admLinks: 13, init: 14 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AdminArticles",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*admLinks*/ ctx[13] === undefined && !("admLinks" in props)) {
    			console.warn("<AdminArticles> was created without expected prop 'admLinks'");
    		}
    	}

    	get admLinks() {
    		return this.$$.ctx[13];
    	}

    	set admLinks(admLinks) {
    		this.$set({ admLinks });
    		flush();
    	}

    	get init() {
    		return this.$$.ctx[14];
    	}

    	set init(value) {
    		throw new Error("<AdminArticles>: Cannot set read-only property 'init'");
    	}
    }

    /* src\adminCategories.svelte generated by Svelte v3.24.1 */

    const file$2 = "src\\adminCategories.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (102:7) {:else}
    function create_else_block_1(ctx) {
    	let t_value = /*category*/ ctx[16][1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*categoriesData*/ 1 && t_value !== (t_value = /*category*/ ctx[16][1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(102:7) {:else}",
    		ctx
    	});

    	return block;
    }

    // (100:7) {#if category[0] == currentlyEdited}
    function create_if_block_1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control form-control-sm");
    			add_location(input, file$2, 100, 8, 2295);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*editedName*/ ctx[2]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*editedName*/ 4 && input.value !== /*editedName*/ ctx[2]) {
    				set_input_value(input, /*editedName*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(100:7) {#if category[0] == currentlyEdited}",
    		ctx
    	});

    	return block;
    }

    // (116:7) {:else}
    function create_else_block(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[11](/*category*/ ctx[16], ...args);
    	}

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[12](/*category*/ ctx[16], ...args);
    	}

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Edytuj";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Usuń";
    			attr_dev(button0, "class", "btn btn-sm btn-primary my-1");
    			add_location(button0, file$2, 116, 8, 2829);
    			attr_dev(button1, "class", "btn btn-sm btn-outline-danger ms-3 my-1");
    			add_location(button1, file$2, 123, 8, 3038);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler_1, false, false, false),
    					listen_dev(button1, "click", click_handler_2, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(116:7) {:else}",
    		ctx
    	});

    	return block;
    }

    // (107:7) {#if category[0] == currentlyEdited}
    function create_if_block(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Zapisz";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Anuluj";
    			attr_dev(button0, "class", "btn btn-sm btn-outline-primary my-1");
    			add_location(button0, file$2, 107, 8, 2510);
    			attr_dev(button1, "class", "btn btn-sm btn-outline-danger ms-3 my-1");
    			add_location(button1, file$2, 108, 8, 2611);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*saveCategory*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*click_handler*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(107:7) {#if category[0] == currentlyEdited}",
    		ctx
    	});

    	return block;
    }

    // (94:4) {#each categoriesData as category}
    function create_each_block$2(ctx) {
    	let tr;
    	let th;
    	let t0_value = /*category*/ ctx[16][0] + "";
    	let t0;
    	let t1;
    	let td0;
    	let t2;
    	let td1;

    	function select_block_type(ctx, dirty) {
    		if (/*category*/ ctx[16][0] == /*currentlyEdited*/ ctx[3]) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*category*/ ctx[16][0] == /*currentlyEdited*/ ctx[3]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			td0 = element("td");
    			if_block0.c();
    			t2 = space();
    			td1 = element("td");
    			if_block1.c();
    			attr_dev(th, "scope", "col");
    			attr_dev(th, "class", "pt-3");
    			add_location(th, file$2, 95, 6, 2151);
    			attr_dev(td0, "class", "pt-3");
    			add_location(td0, file$2, 98, 6, 2223);
    			add_location(td1, file$2, 105, 6, 2451);
    			add_location(tr, file$2, 94, 5, 2139);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, th);
    			append_dev(th, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td0);
    			if_block0.m(td0, null);
    			append_dev(tr, t2);
    			append_dev(tr, td1);
    			if_block1.m(td1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*categoriesData*/ 1 && t0_value !== (t0_value = /*category*/ ctx[16][0] + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(td0, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(td1, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_block0.d();
    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(94:4) {#each categoriesData as category}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let p;
    	let t1;
    	let div0;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t3;
    	let th1;
    	let t5;
    	let th2;
    	let t6;
    	let tbody;
    	let t7;
    	let tr1;
    	let th3;
    	let t9;
    	let td0;
    	let input;
    	let t10;
    	let td1;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*categoriesData*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Categories";
    			t1 = space();
    			div0 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "ID";
    			t3 = space();
    			th1 = element("th");
    			th1.textContent = "Nazwa";
    			t5 = space();
    			th2 = element("th");
    			t6 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			tr1 = element("tr");
    			th3 = element("th");
    			th3.textContent = "Nowa";
    			t9 = space();
    			td0 = element("td");
    			input = element("input");
    			t10 = space();
    			td1 = element("td");
    			button = element("button");
    			button.textContent = "Dodaj";
    			attr_dev(p, "class", "h1 mb-3");
    			add_location(p, file$2, 82, 1, 1829);
    			attr_dev(th0, "scope", "column");
    			add_location(th0, file$2, 87, 5, 1962);
    			attr_dev(th1, "scope", "column");
    			add_location(th1, file$2, 88, 5, 1997);
    			attr_dev(th2, "scope", "column");
    			add_location(th2, file$2, 89, 5, 2035);
    			add_location(tr0, file$2, 86, 4, 1951);
    			add_location(thead, file$2, 85, 3, 1938);
    			attr_dev(th3, "scope", "row");
    			attr_dev(th3, "class", "pt-3");
    			add_location(th3, file$2, 131, 5, 3240);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control form-control-sm");
    			add_location(input, file$2, 133, 6, 3312);
    			attr_dev(td0, "class", "pt-3");
    			add_location(td0, file$2, 132, 5, 3287);
    			attr_dev(button, "class", "btn btn-sm btn-success my-2");
    			add_location(button, file$2, 136, 6, 3419);
    			add_location(td1, file$2, 135, 5, 3407);
    			add_location(tr1, file$2, 130, 4, 3229);
    			add_location(tbody, file$2, 92, 3, 2085);
    			attr_dev(table, "class", "table table-striped");
    			add_location(table, file$2, 84, 2, 1898);
    			attr_dev(div0, "class", "container col-8");
    			add_location(div0, file$2, 83, 1, 1865);
    			attr_dev(div1, "class", "tab-pane container");
    			attr_dev(div1, "id", "categories");
    			add_location(div1, file$2, 81, 0, 1778);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t3);
    			append_dev(tr0, th1);
    			append_dev(tr0, t5);
    			append_dev(tr0, th2);
    			append_dev(table, t6);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(tbody, t7);
    			append_dev(tbody, tr1);
    			append_dev(tr1, th3);
    			append_dev(tr1, t9);
    			append_dev(tr1, td0);
    			append_dev(td0, input);
    			set_input_value(input, /*name*/ ctx[1]);
    			append_dev(tr1, t10);
    			append_dev(tr1, td1);
    			append_dev(td1, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[13]),
    					listen_dev(button, "click", /*addCategory*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentlyEdited, editedName, saveCategory, categoriesData, deleteRecord*/ 109) {
    				each_value = /*categoriesData*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, t7);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*name*/ 2 && input.value !== /*name*/ ctx[1]) {
    				set_input_value(input, /*name*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { admArticles } = $$props;
    	let { admLinks } = $$props;

    	let getAllCategories = async () => {
    		let response = await fetch("http://localhost:5000/adminGetAllCategories", { method: "POST" });
    		let responseJSON = await response.json();
    		return await responseJSON;
    	};

    	let categoriesData = [];
    	let name = "";
    	let editedName = "";
    	let currentlyEdited = 0;

    	const getData = () => {
    		getAllCategories().then(data => {
    			$$invalidate(0, categoriesData = data);
    		});
    	};

    	const addCategory = () => {
    		fetch("http://localhost:5000/adminAddCategory", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({ name })
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    				admArticles.init();
    				admLinks.init();
    			}
    		});
    	};

    	const saveCategory = () => {
    		fetch("http://localhost:5000/adminSaveCategory", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({ id: currentlyEdited, newName: editedName })
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    				$$invalidate(3, currentlyEdited = 0);
    				$$invalidate(2, editedName = "");
    				admArticles.init();
    				admLinks.init();
    			}
    		});
    	};

    	const deleteRecord = id => {
    		fetch("http://localhost:5000/adminDeleteCategory", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({ id })
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    				admArticles.init();
    				admLinks.init();
    			}
    		});
    	};

    	getData();
    	const writable_props = ["admArticles", "admLinks"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AdminCategories> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AdminCategories", $$slots, []);

    	function input_input_handler() {
    		editedName = this.value;
    		$$invalidate(2, editedName);
    	}

    	const click_handler = () => {
    		$$invalidate(3, currentlyEdited = 0);
    		$$invalidate(2, editedName = "");
    	};

    	const click_handler_1 = category => {
    		$$invalidate(3, currentlyEdited = category[0]);
    		$$invalidate(2, editedName = category[1]);
    	};

    	const click_handler_2 = category => deleteRecord(category[0]);

    	function input_input_handler_1() {
    		name = this.value;
    		$$invalidate(1, name);
    	}

    	$$self.$$set = $$props => {
    		if ("admArticles" in $$props) $$invalidate(7, admArticles = $$props.admArticles);
    		if ("admLinks" in $$props) $$invalidate(8, admLinks = $$props.admLinks);
    	};

    	$$self.$capture_state = () => ({
    		admArticles,
    		admLinks,
    		getAllCategories,
    		categoriesData,
    		name,
    		editedName,
    		currentlyEdited,
    		getData,
    		addCategory,
    		saveCategory,
    		deleteRecord
    	});

    	$$self.$inject_state = $$props => {
    		if ("admArticles" in $$props) $$invalidate(7, admArticles = $$props.admArticles);
    		if ("admLinks" in $$props) $$invalidate(8, admLinks = $$props.admLinks);
    		if ("getAllCategories" in $$props) getAllCategories = $$props.getAllCategories;
    		if ("categoriesData" in $$props) $$invalidate(0, categoriesData = $$props.categoriesData);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("editedName" in $$props) $$invalidate(2, editedName = $$props.editedName);
    		if ("currentlyEdited" in $$props) $$invalidate(3, currentlyEdited = $$props.currentlyEdited);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		categoriesData,
    		name,
    		editedName,
    		currentlyEdited,
    		addCategory,
    		saveCategory,
    		deleteRecord,
    		admArticles,
    		admLinks,
    		input_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		input_input_handler_1
    	];
    }

    class AdminCategories extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { admArticles: 7, admLinks: 8 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AdminCategories",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*admArticles*/ ctx[7] === undefined && !("admArticles" in props)) {
    			console.warn("<AdminCategories> was created without expected prop 'admArticles'");
    		}

    		if (/*admLinks*/ ctx[8] === undefined && !("admLinks" in props)) {
    			console.warn("<AdminCategories> was created without expected prop 'admLinks'");
    		}
    	}

    	get admArticles() {
    		throw new Error("<AdminCategories>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set admArticles(value) {
    		throw new Error("<AdminCategories>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get admLinks() {
    		throw new Error("<AdminCategories>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set admLinks(value) {
    		throw new Error("<AdminCategories>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\adminGalleries.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;
    const file$3 = "src\\adminGalleries.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[33] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	child_ctx[40] = i;
    	return child_ctx;
    }

    // (193:5) {#each galleriesData as gallery, idx}
    function create_each_block_3(ctx) {
    	let option;

    	let t0_value = (/*gallery*/ ctx[38][0] == 0
    	? "*NOWA*"
    	: `${/*gallery*/ ctx[38][0]} - ${/*gallery*/ ctx[38][1]}`) + "";

    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*idx*/ ctx[40];
    			option.value = option.__value;
    			add_location(option, file$3, 193, 6, 4884);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*galleriesData*/ 1 && t0_value !== (t0_value = (/*gallery*/ ctx[38][0] == 0
    			? "*NOWA*"
    			: `${/*gallery*/ ctx[38][0]} - ${/*gallery*/ ctx[38][1]}`) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(193:5) {#each galleriesData as gallery, idx}",
    		ctx
    	});

    	return block;
    }

    // (209:3) {#if id != 0}
    function create_if_block$1(ctx) {
    	let div;
    	let span;
    	let t1;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t3;
    	let th1;
    	let t5;
    	let th2;
    	let t6;
    	let tbody;
    	let t7;
    	let tr1;
    	let th3;
    	let t9;
    	let td0;
    	let input;
    	let t10;
    	let td1;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*photos*/ ctx[5];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Fotografie";
    			t1 = space();
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "ID";
    			t3 = space();
    			th1 = element("th");
    			th1.textContent = "Obraz";
    			t5 = space();
    			th2 = element("th");
    			t6 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			tr1 = element("tr");
    			th3 = element("th");
    			th3.textContent = "Nowa";
    			t9 = space();
    			td0 = element("td");
    			input = element("input");
    			t10 = space();
    			td1 = element("td");
    			button = element("button");
    			button.textContent = "Dodaj";
    			attr_dev(span, "class", "form-label");
    			add_location(span, file$3, 210, 5, 5632);
    			attr_dev(th0, "scope", "column");
    			add_location(th0, file$3, 214, 8, 5754);
    			attr_dev(th1, "scope", "column");
    			add_location(th1, file$3, 215, 8, 5792);
    			attr_dev(th2, "scope", "column");
    			add_location(th2, file$3, 216, 8, 5833);
    			add_location(tr0, file$3, 213, 7, 5740);
    			add_location(thead, file$3, 212, 6, 5724);
    			attr_dev(th3, "scope", "row");
    			attr_dev(th3, "class", "pt-3");
    			add_location(th3, file$3, 263, 8, 7273);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control form-control-sm");
    			add_location(input, file$3, 265, 9, 7351);
    			attr_dev(td0, "class", "pt-3");
    			add_location(td0, file$3, 264, 8, 7323);
    			attr_dev(button, "class", "btn btn-sm btn-success my-2");
    			add_location(button, file$3, 268, 9, 7475);
    			add_location(td1, file$3, 267, 8, 7460);
    			add_location(tr1, file$3, 262, 7, 7259);
    			add_location(tbody, file$3, 219, 6, 5892);
    			attr_dev(table, "class", "table table-striped");
    			add_location(table, file$3, 211, 5, 5681);
    			attr_dev(div, "class", "container col-8 my-4");
    			add_location(div, file$3, 209, 4, 5591);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);
    			append_dev(div, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t3);
    			append_dev(tr0, th1);
    			append_dev(tr0, t5);
    			append_dev(tr0, th2);
    			append_dev(table, t6);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(tbody, t7);
    			append_dev(tbody, tr1);
    			append_dev(tr1, th3);
    			append_dev(tr1, t9);
    			append_dev(tr1, td0);
    			append_dev(td0, input);
    			set_input_value(input, /*newImagePath*/ ctx[4]);
    			append_dev(tr1, t10);
    			append_dev(tr1, td1);
    			append_dev(td1, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[25]),
    					listen_dev(button, "click", /*addPhoto*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentlyEdited, editedImagePath, savePhoto, photos, deletePhoto, galleriesImages*/ 41824) {
    				each_value_1 = /*photos*/ ctx[5];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, t7);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*newImagePath*/ 16 && input.value !== /*newImagePath*/ ctx[4]) {
    				set_input_value(input, /*newImagePath*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(209:3) {#if id != 0}",
    		ctx
    	});

    	return block;
    }

    // (233:10) {:else}
    function create_else_block_1$1(ctx) {
    	let t_value = /*photo*/ ctx[33][2] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*photos*/ 32 && t_value !== (t_value = /*photo*/ ctx[33][2] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(233:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (227:10) {#if photo[0] == currentlyEdited}
    function create_if_block_2(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*galleriesImages*/ ctx[8];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "form-control form-select-sm");
    			if (/*editedImagePath*/ ctx[6] === void 0) add_render_callback(() => /*select_change_handler_1*/ ctx[21].call(select));
    			add_location(select, file$3, 227, 11, 6109);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*editedImagePath*/ ctx[6]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_1*/ ctx[21]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*galleriesImages*/ 256) {
    				each_value_2 = /*galleriesImages*/ ctx[8];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty[0] & /*editedImagePath, galleriesImages*/ 320) {
    				select_option(select, /*editedImagePath*/ ctx[6]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(227:10) {#if photo[0] == currentlyEdited}",
    		ctx
    	});

    	return block;
    }

    // (229:12) {#each galleriesImages as image}
    function create_each_block_2$2(ctx) {
    	let option;
    	let t_value = /*image*/ ctx[30] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*image*/ ctx[30];
    			option.value = option.__value;
    			add_location(option, file$3, 229, 13, 6243);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*galleriesImages*/ 256 && t_value !== (t_value = /*image*/ ctx[30] + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*galleriesImages*/ 256 && option_value_value !== (option_value_value = /*image*/ ctx[30])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$2.name,
    		type: "each",
    		source: "(229:12) {#each galleriesImages as image}",
    		ctx
    	});

    	return block;
    }

    // (247:10) {:else}
    function create_else_block$1(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[23](/*photo*/ ctx[33], ...args);
    	}

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[24](/*photo*/ ctx[33], ...args);
    	}

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Edytuj";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Usuń";
    			attr_dev(button0, "class", "btn btn-sm btn-primary my-1");
    			add_location(button0, file$3, 247, 11, 6820);
    			attr_dev(button1, "class", "btn btn-sm btn-outline-danger ms-3 my-1");
    			add_location(button1, file$3, 254, 11, 7049);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler_1, false, false, false),
    					listen_dev(button1, "click", click_handler_2, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(247:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (238:10) {#if photo[0] == currentlyEdited}
    function create_if_block_1$1(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Zapisz";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Anuluj";
    			attr_dev(button0, "class", "btn btn-sm btn-outline-primary my-1");
    			add_location(button0, file$3, 238, 11, 6472);
    			attr_dev(button1, "class", "btn btn-sm btn-outline-danger ms-3 my-1");
    			add_location(button1, file$3, 239, 11, 6573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*savePhoto*/ ctx[13], false, false, false),
    					listen_dev(button1, "click", /*click_handler*/ ctx[22], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(238:10) {#if photo[0] == currentlyEdited}",
    		ctx
    	});

    	return block;
    }

    // (221:7) {#each photos as photo}
    function create_each_block_1$2(ctx) {
    	let tr;
    	let th;
    	let t0_value = /*photo*/ ctx[33][0] + "";
    	let t0;
    	let t1;
    	let td0;
    	let t2;
    	let td1;

    	function select_block_type(ctx, dirty) {
    		if (/*photo*/ ctx[33][0] == /*currentlyEdited*/ ctx[9]) return create_if_block_2;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*photo*/ ctx[33][0] == /*currentlyEdited*/ ctx[9]) return create_if_block_1$1;
    		return create_else_block$1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			td0 = element("td");
    			if_block0.c();
    			t2 = space();
    			td1 = element("td");
    			if_block1.c();
    			attr_dev(th, "scope", "col");
    			attr_dev(th, "class", "pt-3");
    			add_location(th, file$3, 222, 9, 5956);
    			attr_dev(td0, "class", "pt-3");
    			add_location(td0, file$3, 225, 9, 6034);
    			add_location(td1, file$3, 236, 9, 6410);
    			add_location(tr, file$3, 221, 8, 5941);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, th);
    			append_dev(th, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td0);
    			if_block0.m(td0, null);
    			append_dev(tr, t2);
    			append_dev(tr, td1);
    			if_block1.m(td1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*photos*/ 32 && t0_value !== (t0_value = /*photo*/ ctx[33][0] + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(td0, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(td1, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_block0.d();
    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(221:7) {#each photos as photo}",
    		ctx
    	});

    	return block;
    }

    // (294:6) {#each galleriesImages as image}
    function create_each_block$3(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*image*/ ctx[30] + "";
    	let t0;
    	let t1;
    	let td1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			img = element("img");
    			t2 = space();
    			attr_dev(td0, "class", "text-center fw-bold");
    			add_location(td0, file$3, 295, 8, 8321);
    			attr_dev(img, "class", "img-preview");
    			if (img.src !== (img_src_value = `http://localhost:5000/uploads/galleries/${/*image*/ ctx[30]}`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*image*/ ctx[30]);
    			add_location(img, file$3, 297, 9, 8414);
    			attr_dev(td1, "class", "text-start lh-1");
    			add_location(td1, file$3, 296, 8, 8375);
    			add_location(tr, file$3, 294, 7, 8307);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, img);
    			append_dev(tr, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*galleriesImages*/ 256 && t0_value !== (t0_value = /*image*/ ctx[30] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*galleriesImages*/ 256 && img.src !== (img_src_value = `http://localhost:5000/uploads/galleries/${/*image*/ ctx[30]}`)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*galleriesImages*/ 256 && img_alt_value !== (img_alt_value = /*image*/ ctx[30])) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(294:6) {#each galleriesImages as image}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div7;
    	let nav;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let div6;
    	let div2;
    	let p0;
    	let t5;
    	let div0;
    	let select;
    	let t6;
    	let button0;
    	let span0;
    	let t8;
    	let button1;
    	let span1;
    	let t10;
    	let div1;
    	let label;
    	let t12;
    	let input0;
    	let t13;
    	let button2;
    	let t15;
    	let t16;
    	let div5;
    	let p1;
    	let t18;
    	let div3;
    	let input1;
    	let t19;
    	let button3;
    	let t21;
    	let div4;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t23;
    	let th1;
    	let t25;
    	let tbody;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*galleriesData*/ ctx[0];
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let if_block = /*id*/ ctx[2] != 0 && create_if_block$1(ctx);
    	let each_value = /*galleriesImages*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "Galleries";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Upload";
    			t3 = space();
    			div6 = element("div");
    			div2 = element("div");
    			p0 = element("p");
    			p0.textContent = "Galleries";
    			t5 = space();
    			div0 = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t6 = space();
    			button0 = element("button");
    			span0 = element("span");
    			span0.textContent = "+";
    			t8 = space();
    			button1 = element("button");
    			span1 = element("span");
    			span1.textContent = "×";
    			t10 = space();
    			div1 = element("div");
    			label = element("label");
    			label.textContent = "Nazwa";
    			t12 = space();
    			input0 = element("input");
    			t13 = space();
    			button2 = element("button");
    			button2.textContent = "Zapisz";
    			t15 = space();
    			if (if_block) if_block.c();
    			t16 = space();
    			div5 = element("div");
    			p1 = element("p");
    			p1.textContent = "Upload";
    			t18 = space();
    			div3 = element("div");
    			input1 = element("input");
    			t19 = space();
    			button3 = element("button");
    			button3.textContent = "Wgraj";
    			t21 = space();
    			div4 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Nazwa";
    			t23 = space();
    			th1 = element("th");
    			th1.textContent = "Podgląd";
    			t25 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(a0, "href", "#galleries-composition");
    			attr_dev(a0, "class", "nav-link active");
    			attr_dev(a0, "data-bs-toggle", "tab");
    			add_location(a0, file$3, 182, 2, 4267);
    			attr_dev(a1, "href", "#galleries-images");
    			attr_dev(a1, "class", "nav-link");
    			attr_dev(a1, "data-bs-toggle", "tab");
    			add_location(a1, file$3, 183, 2, 4362);
    			attr_dev(nav, "class", "nav nav-pills justify-content-start flex-column flex-md-row mb-3 mx-3");
    			add_location(nav, file$3, 181, 1, 4180);
    			attr_dev(p0, "class", "h1 mb-3");
    			add_location(p0, file$3, 188, 3, 4552);
    			attr_dev(select, "class", "form-select-sm col-8");
    			if (/*currentID*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[19].call(select));
    			add_location(select, file$3, 191, 4, 4749);
    			attr_dev(span0, "class", "fw-bold");
    			add_location(span0, file$3, 198, 71, 5094);
    			attr_dev(button0, "class", "btn btn-sm btn-primary px-3");
    			add_location(button0, file$3, 198, 4, 5027);
    			attr_dev(span1, "class", "fw-bold");
    			add_location(span1, file$3, 199, 81, 5217);
    			attr_dev(button1, "class", "btn btn-sm btn-outline-danger px-3");
    			add_location(button1, file$3, 199, 4, 5140);
    			attr_dev(div0, "class", "container d-flex justify-content-start gap-2 align-items-center mb-3 col-sm-10 col-md-8 mx-auto");
    			add_location(div0, file$3, 189, 3, 4589);
    			attr_dev(label, "for", "galleryName");
    			attr_dev(label, "class", "form-label");
    			add_location(label, file$3, 202, 4, 5329);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "galleryName");
    			add_location(input0, file$3, 203, 4, 5392);
    			attr_dev(button2, "class", "btn btn-primary mt-4");
    			add_location(button2, file$3, 205, 4, 5477);
    			attr_dev(div1, "class", "container col-sm-10 col-md-8 mx-auto");
    			add_location(div1, file$3, 201, 3, 5273);
    			attr_dev(div2, "class", "tab-pane container active");
    			attr_dev(div2, "id", "galleries-composition");
    			add_location(div2, file$3, 187, 2, 4481);
    			attr_dev(p1, "class", "h1");
    			add_location(p1, file$3, 277, 3, 7708);
    			attr_dev(input1, "name", "file");
    			attr_dev(input1, "type", "file");
    			input1.multiple = true;
    			attr_dev(input1, "accept", "image/*");
    			attr_dev(input1, "class", "form-control mt-4");
    			add_location(input1, file$3, 280, 4, 7774);
    			attr_dev(button3, "type", "button");
    			attr_dev(button3, "class", "btn btn-success mt-3");
    			add_location(button3, file$3, 281, 4, 7890);
    			attr_dev(div3, "class", "container col-6");
    			add_location(div3, file$3, 279, 3, 7739);
    			attr_dev(th0, "class", "text-center");
    			attr_dev(th0, "scope", "col");
    			add_location(th0, file$3, 288, 7, 8114);
    			attr_dev(th1, "class", "text-start");
    			attr_dev(th1, "scope", "col");
    			add_location(th1, file$3, 289, 7, 8169);
    			add_location(tr, file$3, 287, 6, 8101);
    			add_location(thead, file$3, 286, 5, 8086);
    			add_location(tbody, file$3, 292, 5, 8251);
    			attr_dev(table, "class", "table table-striped");
    			add_location(table, file$3, 285, 4, 8044);
    			attr_dev(div4, "class", "container col-8 mt-4");
    			add_location(div4, file$3, 284, 3, 8004);
    			attr_dev(div5, "class", "tab-pane container");
    			attr_dev(div5, "id", "galleries-images");
    			add_location(div5, file$3, 276, 2, 7649);
    			attr_dev(div6, "class", "tab-content");
    			add_location(div6, file$3, 186, 1, 4452);
    			attr_dev(div7, "class", "tab-pane container");
    			attr_dev(div7, "id", "galleries");
    			add_location(div7, file$3, 180, 0, 4130);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, nav);
    			append_dev(nav, a0);
    			append_dev(nav, t1);
    			append_dev(nav, a1);
    			append_dev(div7, t3);
    			append_dev(div7, div6);
    			append_dev(div6, div2);
    			append_dev(div2, p0);
    			append_dev(div2, t5);
    			append_dev(div2, div0);
    			append_dev(div0, select);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, /*currentID*/ ctx[1]);
    			append_dev(div0, t6);
    			append_dev(div0, button0);
    			append_dev(button0, span0);
    			append_dev(div0, t8);
    			append_dev(div0, button1);
    			append_dev(button1, span1);
    			append_dev(div2, t10);
    			append_dev(div2, div1);
    			append_dev(div1, label);
    			append_dev(div1, t12);
    			append_dev(div1, input0);
    			set_input_value(input0, /*name*/ ctx[3]);
    			append_dev(div1, t13);
    			append_dev(div1, button2);
    			append_dev(div2, t15);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div6, t16);
    			append_dev(div6, div5);
    			append_dev(div5, p1);
    			append_dev(div5, t18);
    			append_dev(div5, div3);
    			append_dev(div3, input1);
    			append_dev(div3, t19);
    			append_dev(div3, button3);
    			append_dev(div5, t21);
    			append_dev(div5, div4);
    			append_dev(div4, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t23);
    			append_dev(tr, th1);
    			append_dev(table, t25);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[19]),
    					listen_dev(select, "change", /*changeData*/ ctx[16], false, false, false),
    					listen_dev(button0, "click", /*addGallery*/ ctx[10], false, false, false),
    					listen_dev(button1, "click", /*deleteGallery*/ ctx[12], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[20]),
    					listen_dev(button2, "click", /*saveGallery*/ ctx[11], false, false, false),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[26]),
    					listen_dev(button3, "click", /*uploadGalleryImages*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*galleriesData*/ 1) {
    				each_value_3 = /*galleriesData*/ ctx[0];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_3.length;
    			}

    			if (dirty[0] & /*currentID*/ 2) {
    				select_option(select, /*currentID*/ ctx[1]);
    			}

    			if (dirty[0] & /*name*/ 8 && input0.value !== /*name*/ ctx[3]) {
    				set_input_value(input0, /*name*/ ctx[3]);
    			}

    			if (/*id*/ ctx[2] != 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*galleriesImages*/ 256) {
    				each_value = /*galleriesImages*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			destroy_each(each_blocks_1, detaching);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { admArticles } = $$props;

    	let getAllGalleries = async () => {
    		let response = await fetch("http://localhost:5000/adminGetAllGalleries", { method: "POST" });
    		let responseJSON = await response.json();
    		return await responseJSON;
    	};

    	let galleriesData = [];
    	let currentID = 0;
    	let id = 0;
    	let name = "";
    	let newImagePath = "";
    	let photos = [];
    	let editedImagePath = "";
    	let uploadFiles = [];
    	let galleriesImages = [];
    	let currentlyEdited = 0;

    	const getGalleriesImages = () => {
    		fetch("http://localhost:5000/adminGetGalleriesImages", { method: "POST" }).then(response => response.json()).then(data => {
    			console.log(data);
    			$$invalidate(8, galleriesImages = data);
    		});
    	};

    	const getData = () => {
    		getAllGalleries().then(data => {
    			$$invalidate(0, galleriesData = data);
    			getGalleriesImages();
    			changeData();
    		});
    	};

    	const addGallery = () => {
    		$$invalidate(0, galleriesData = [...galleriesData, [0, "", []]]);
    		$$invalidate(1, currentID = galleriesData.length - 1);
    		changeData();
    	};

    	const saveGallery = () => {
    		if (galleriesData.length == 0) return;

    		fetch("http://localhost:5000/adminSaveGallery", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({ id: galleriesData[currentID][0], name })
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    				admArticles.init();
    			}
    		});
    	};

    	const deleteGallery = () => {
    		if (galleriesData.length == 0) return;

    		if (galleriesData[currentID][0] == 0) {
    			$$invalidate(0, galleriesData = galleriesData.filter((elem, idx) => {
    				return idx != currentID;
    			}));

    			$$invalidate(1, currentID = galleriesData.length - 1);
    			changeData();
    		} else {
    			fetch("http://localhost:5000/adminDeleteGallery", {
    				method: "POST",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify({ id: galleriesData[currentID][0] })
    			}).then(response => response.json()).then(data => {
    				if (data.state == "valid") {
    					$$invalidate(1, currentID = galleriesData.length - 2);
    					getData();
    					admArticles.init();
    				}
    			});
    		}
    	};

    	const savePhoto = () => {
    		fetch("http://localhost:5000/adminSavePhoto", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				id: currentlyEdited,
    				newImagePath: editedImagePath
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    				$$invalidate(9, currentlyEdited = 0);
    				$$invalidate(6, editedImagePath = "");
    				admArticles.init();
    			}
    		});
    	};

    	const addPhoto = () => {
    		fetch("http://localhost:5000/adminAddPhoto", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				galleryID: galleriesData[currentID][0],
    				imagePath: newImagePath
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				$$invalidate(4, newImagePath = "");
    				getData();
    			}
    		});
    	};

    	const deletePhoto = id => {
    		fetch("http://localhost:5000/adminDeletePhoto", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({ id })
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    			}
    		});
    	};

    	const changeData = () => {
    		if (galleriesData.length > 0) {
    			$$invalidate(2, id = galleriesData[currentID][0]);
    			$$invalidate(3, name = galleriesData[currentID][1]);
    			$$invalidate(5, photos = galleriesData[currentID][2]);
    		} else {
    			$$invalidate(2, [id, name, photos] = ["", "", []], id, $$invalidate(3, name), $$invalidate(5, photos));
    		}
    	};

    	const uploadGalleryImages = () => {
    		if (uploadFiles.length == 0) return;

    		for (let file of uploadFiles) {
    			let formData = new FormData();
    			formData.append("file", file);

    			fetch("http://localhost:5000/adminUploadGalleryImages", { method: "POST", body: formData }).then(response => response.json()).then(() => {
    				getData();
    			});
    		}

    		$$invalidate(7, uploadFiles = []);
    	};

    	getData();
    	const writable_props = ["admArticles"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<AdminGalleries> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AdminGalleries", $$slots, []);

    	function select_change_handler() {
    		currentID = select_value(this);
    		$$invalidate(1, currentID);
    	}

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(3, name);
    	}

    	function select_change_handler_1() {
    		editedImagePath = select_value(this);
    		$$invalidate(6, editedImagePath);
    		$$invalidate(8, galleriesImages);
    	}

    	const click_handler = () => {
    		$$invalidate(9, currentlyEdited = 0);
    		$$invalidate(6, editedImagePath = "");
    	};

    	const click_handler_1 = photo => {
    		$$invalidate(9, currentlyEdited = photo[0]);
    		$$invalidate(6, editedImagePath = photo[2]);
    	};

    	const click_handler_2 = photo => deletePhoto(photo[0]);

    	function input_input_handler() {
    		newImagePath = this.value;
    		$$invalidate(4, newImagePath);
    	}

    	function input1_change_handler() {
    		uploadFiles = this.files;
    		$$invalidate(7, uploadFiles);
    	}

    	$$self.$$set = $$props => {
    		if ("admArticles" in $$props) $$invalidate(18, admArticles = $$props.admArticles);
    	};

    	$$self.$capture_state = () => ({
    		admArticles,
    		getAllGalleries,
    		galleriesData,
    		currentID,
    		id,
    		name,
    		newImagePath,
    		photos,
    		editedImagePath,
    		uploadFiles,
    		galleriesImages,
    		currentlyEdited,
    		getGalleriesImages,
    		getData,
    		addGallery,
    		saveGallery,
    		deleteGallery,
    		savePhoto,
    		addPhoto,
    		deletePhoto,
    		changeData,
    		uploadGalleryImages
    	});

    	$$self.$inject_state = $$props => {
    		if ("admArticles" in $$props) $$invalidate(18, admArticles = $$props.admArticles);
    		if ("getAllGalleries" in $$props) getAllGalleries = $$props.getAllGalleries;
    		if ("galleriesData" in $$props) $$invalidate(0, galleriesData = $$props.galleriesData);
    		if ("currentID" in $$props) $$invalidate(1, currentID = $$props.currentID);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    		if ("newImagePath" in $$props) $$invalidate(4, newImagePath = $$props.newImagePath);
    		if ("photos" in $$props) $$invalidate(5, photos = $$props.photos);
    		if ("editedImagePath" in $$props) $$invalidate(6, editedImagePath = $$props.editedImagePath);
    		if ("uploadFiles" in $$props) $$invalidate(7, uploadFiles = $$props.uploadFiles);
    		if ("galleriesImages" in $$props) $$invalidate(8, galleriesImages = $$props.galleriesImages);
    		if ("currentlyEdited" in $$props) $$invalidate(9, currentlyEdited = $$props.currentlyEdited);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		galleriesData,
    		currentID,
    		id,
    		name,
    		newImagePath,
    		photos,
    		editedImagePath,
    		uploadFiles,
    		galleriesImages,
    		currentlyEdited,
    		addGallery,
    		saveGallery,
    		deleteGallery,
    		savePhoto,
    		addPhoto,
    		deletePhoto,
    		changeData,
    		uploadGalleryImages,
    		admArticles,
    		select_change_handler,
    		input0_input_handler,
    		select_change_handler_1,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		input_input_handler,
    		input1_change_handler
    	];
    }

    class AdminGalleries extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { admArticles: 18 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AdminGalleries",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*admArticles*/ ctx[18] === undefined && !("admArticles" in props)) {
    			console_1.warn("<AdminGalleries> was created without expected prop 'admArticles'");
    		}
    	}

    	get admArticles() {
    		throw new Error("<AdminGalleries>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set admArticles(value) {
    		throw new Error("<AdminGalleries>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\adminLinks.svelte generated by Svelte v3.24.1 */

    const file$4 = "src\\adminLinks.svelte";

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	return child_ctx;
    }

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[43] = list[i];
    	return child_ctx;
    }

    // (207:41) 
    function create_if_block_15(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Kategoria");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(207:41) ",
    		ctx
    	});

    	return block;
    }

    // (205:40) 
    function create_if_block_14(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Artykuł");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(205:40) ",
    		ctx
    	});

    	return block;
    }

    // (203:44) 
    function create_if_block_13(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Strona artykułów");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(203:44) ",
    		ctx
    	});

    	return block;
    }

    // (201:33) 
    function create_if_block_12(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Strona główna");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(201:33) ",
    		ctx
    	});

    	return block;
    }

    // (187:8) {#if link[0] == currentlyEdited}
    function create_if_block_11(ctx) {
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Strona główna";
    			option1 = element("option");
    			option1.textContent = "Strona artykułów";
    			option2 = element("option");
    			option2.textContent = "Artykuł";
    			option3 = element("option");
    			option3.textContent = "Kategoria";
    			option0.__value = "/";
    			option0.value = option0.__value;
    			add_location(option0, file$4, 195, 10, 4690);
    			option1.__value = "/allArticles";
    			option1.value = option1.__value;
    			add_location(option1, file$4, 196, 10, 4742);
    			option2.__value = "/article";
    			option2.value = option2.__value;
    			add_location(option2, file$4, 197, 10, 4808);
    			option3.__value = "/category";
    			option3.value = option3.__value;
    			add_location(option3, file$4, 198, 10, 4861);
    			attr_dev(select, "class", "form-select-sm form-control");
    			if (/*editedName*/ ctx[5] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[18].call(select));
    			add_location(select, file$4, 188, 9, 4505);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			select_option(select, /*editedName*/ ctx[5]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*change_handler*/ ctx[17], false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[18])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*editedName*/ 32) {
    				select_option(select, /*editedName*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(187:8) {#if link[0] == currentlyEdited}",
    		ctx
    	});

    	return block;
    }

    // (243:41) 
    function create_if_block_9(ctx) {
    	let if_block_anchor;
    	let if_block = /*categoriesData*/ ctx[4].length != 0 && create_if_block_10(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*categoriesData*/ ctx[4].length != 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_10(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(243:41) ",
    		ctx
    	});

    	return block;
    }

    // (231:40) 
    function create_if_block_7(ctx) {
    	let if_block_anchor;
    	let if_block = /*articlesData*/ ctx[3].length != 0 && create_if_block_8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*articlesData*/ ctx[3].length != 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_8(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(231:40) ",
    		ctx
    	});

    	return block;
    }

    // (213:8) {#if link[0] == currentlyEdited}
    function create_if_block_4(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*editedName*/ ctx[5] == "/article") return create_if_block_5;
    		if (/*editedName*/ ctx[5] == "/category") return create_if_block_6;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(213:8) {#if link[0] == currentlyEdited}",
    		ctx
    	});

    	return block;
    }

    // (244:9) {#if categoriesData.length != 0}
    function create_if_block_10(ctx) {
    	let t0_value = [.../*categoriesData*/ ctx[4].filter(func_2)][0][0] + "";
    	let t0;
    	let t1;
    	let t2_value = [.../*categoriesData*/ ctx[4].filter(func_3)][0][1] + "";
    	let t2;

    	function func_2(...args) {
    		return /*func_2*/ ctx[23](/*link*/ ctx[43], ...args);
    	}

    	function func_3(...args) {
    		return /*func_3*/ ctx[24](/*link*/ ctx[43], ...args);
    	}

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*categoriesData, linksData*/ 20 && t0_value !== (t0_value = [.../*categoriesData*/ ctx[4].filter(func_2)][0][0] + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*categoriesData, linksData*/ 20 && t2_value !== (t2_value = [.../*categoriesData*/ ctx[4].filter(func_3)][0][1] + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(244:9) {#if categoriesData.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (232:9) {#if articlesData.length != 0}
    function create_if_block_8(ctx) {
    	let t0_value = [.../*articlesData*/ ctx[3].filter(func)][0][0] + "";
    	let t0;
    	let t1;
    	let t2_value = [.../*articlesData*/ ctx[3].filter(func_1)][0][1] + "";
    	let t2;

    	function func(...args) {
    		return /*func*/ ctx[21](/*link*/ ctx[43], ...args);
    	}

    	function func_1(...args) {
    		return /*func_1*/ ctx[22](/*link*/ ctx[43], ...args);
    	}

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*articlesData, linksData*/ 12 && t0_value !== (t0_value = [.../*articlesData*/ ctx[3].filter(func)][0][0] + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*articlesData, linksData*/ 12 && t2_value !== (t2_value = [.../*articlesData*/ ctx[3].filter(func_1)][0][1] + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(232:9) {#if articlesData.length != 0}",
    		ctx
    	});

    	return block;
    }

    // (222:45) 
    function create_if_block_6(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*categoriesData*/ ctx[4];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "form-select-sm form-control");
    			if (/*editedDbID*/ ctx[6] === void 0) add_render_callback(() => /*select_change_handler_2*/ ctx[20].call(select));
    			add_location(select, file$4, 222, 10, 5650);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*editedDbID*/ ctx[6]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_2*/ ctx[20]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*categoriesData*/ 16) {
    				each_value_4 = /*categoriesData*/ ctx[4];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}

    			if (dirty[0] & /*editedDbID, categoriesData*/ 80) {
    				select_option(select, /*editedDbID*/ ctx[6]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(222:45) ",
    		ctx
    	});

    	return block;
    }

    // (214:9) {#if editedName == "/article"}
    function create_if_block_5(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*articlesData*/ ctx[3];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "form-select-sm form-control");
    			if (/*editedDbID*/ ctx[6] === void 0) add_render_callback(() => /*select_change_handler_1*/ ctx[19].call(select));
    			add_location(select, file$4, 214, 10, 5332);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*editedDbID*/ ctx[6]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_1*/ ctx[19]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*articlesData*/ 8) {
    				each_value_3 = /*articlesData*/ ctx[3];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}

    			if (dirty[0] & /*editedDbID, categoriesData*/ 80) {
    				select_option(select, /*editedDbID*/ ctx[6]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(214:9) {#if editedName == \\\"/article\\\"}",
    		ctx
    	});

    	return block;
    }

    // (224:11) {#each categoriesData as category}
    function create_each_block_4(ctx) {
    	let option;
    	let t0_value = /*category*/ ctx[40][0] + "";
    	let t0;
    	let t1;
    	let t2_value = /*category*/ ctx[40][1] + "";
    	let t2;
    	let t3;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    			t3 = space();
    			option.__value = option_value_value = /*category*/ ctx[40][0];
    			option.value = option.__value;
    			add_location(option, file$4, 224, 12, 5779);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    			append_dev(option, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*categoriesData*/ 16 && t0_value !== (t0_value = /*category*/ ctx[40][0] + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*categoriesData*/ 16 && t2_value !== (t2_value = /*category*/ ctx[40][1] + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*categoriesData*/ 16 && option_value_value !== (option_value_value = /*category*/ ctx[40][0])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(224:11) {#each categoriesData as category}",
    		ctx
    	});

    	return block;
    }

    // (216:11) {#each articlesData as article}
    function create_each_block_3$1(ctx) {
    	let option;
    	let t0_value = /*article*/ ctx[37][0] + "";
    	let t0;
    	let t1;
    	let t2_value = /*article*/ ctx[37][1] + "";
    	let t2;
    	let t3;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    			t3 = space();
    			option.__value = option_value_value = /*article*/ ctx[37][0];
    			option.value = option.__value;
    			add_location(option, file$4, 216, 12, 5458);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    			append_dev(option, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*articlesData*/ 8 && t0_value !== (t0_value = /*article*/ ctx[37][0] + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*articlesData*/ 8 && t2_value !== (t2_value = /*article*/ ctx[37][1] + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*articlesData*/ 8 && option_value_value !== (option_value_value = /*article*/ ctx[37][0])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3$1.name,
    		type: "each",
    		source: "(216:11) {#each articlesData as article}",
    		ctx
    	});

    	return block;
    }

    // (261:8) {:else}
    function create_else_block_1$2(ctx) {
    	let t_value = /*link*/ ctx[43][3] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*linksData*/ 4 && t_value !== (t_value = /*link*/ ctx[43][3] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(261:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (259:8) {#if link[0] == currentlyEdited}
    function create_if_block_3(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control form-control-sm");
    			add_location(input, file$4, 259, 9, 6812);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*editedText*/ ctx[7]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[25]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*editedText*/ 128 && input.value !== /*editedText*/ ctx[7]) {
    				set_input_value(input, /*editedText*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(259:8) {#if link[0] == currentlyEdited}",
    		ctx
    	});

    	return block;
    }

    // (278:8) {:else}
    function create_else_block$2(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[27](/*link*/ ctx[43], ...args);
    	}

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[28](/*link*/ ctx[43], ...args);
    	}

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Edytuj";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Usuń";
    			attr_dev(button0, "class", "btn btn-sm btn-primary my-1");
    			add_location(button0, file$4, 278, 9, 7409);
    			attr_dev(button1, "class", "btn btn-sm btn-outline-danger ms-3 my-1");
    			add_location(button1, file$4, 287, 9, 7685);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler_3, false, false, false),
    					listen_dev(button1, "click", click_handler_4, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(278:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (267:8) {#if link[0] == currentlyEdited}
    function create_if_block_2$1(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Zapisz";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Anuluj";
    			attr_dev(button0, "class", "btn btn-sm btn-outline-primary my-1");
    			add_location(button0, file$4, 267, 9, 7028);
    			attr_dev(button1, "class", "btn btn-sm btn-outline-danger ms-3 my-1");
    			add_location(button1, file$4, 268, 9, 7126);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*saveLink*/ ctx[13], false, false, false),
    					listen_dev(button1, "click", /*click_handler_2*/ ctx[26], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(267:8) {#if link[0] == currentlyEdited}",
    		ctx
    	});

    	return block;
    }

    // (180:5) {#each linksData as link}
    function create_each_block_2$3(ctx) {
    	let tr;
    	let th;
    	let t0_value = /*link*/ ctx[43][0] + "";
    	let t0;
    	let t1;
    	let td0;
    	let t2;
    	let td1;
    	let t3;
    	let td2;
    	let t4;
    	let td3;

    	function select_block_type(ctx, dirty) {
    		if (/*link*/ ctx[43][0] == /*currentlyEdited*/ ctx[11]) return create_if_block_11;
    		if (/*link*/ ctx[43][1] == "/") return create_if_block_12;
    		if (/*link*/ ctx[43][1] == "/allArticles") return create_if_block_13;
    		if (/*link*/ ctx[43][1] == "/article") return create_if_block_14;
    		if (/*link*/ ctx[43][1] == "/category") return create_if_block_15;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*link*/ ctx[43][0] == /*currentlyEdited*/ ctx[11]) return create_if_block_4;
    		if (/*link*/ ctx[43][1] == "/article") return create_if_block_7;
    		if (/*link*/ ctx[43][1] == "/category") return create_if_block_9;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1 && current_block_type_1(ctx);

    	function select_block_type_3(ctx, dirty) {
    		if (/*link*/ ctx[43][0] == /*currentlyEdited*/ ctx[11]) return create_if_block_3;
    		return create_else_block_1$2;
    	}

    	let current_block_type_2 = select_block_type_3(ctx);
    	let if_block2 = current_block_type_2(ctx);

    	function select_block_type_4(ctx, dirty) {
    		if (/*link*/ ctx[43][0] == /*currentlyEdited*/ ctx[11]) return create_if_block_2$1;
    		return create_else_block$2;
    	}

    	let current_block_type_3 = select_block_type_4(ctx);
    	let if_block3 = current_block_type_3(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			td0 = element("td");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			td1 = element("td");
    			if (if_block1) if_block1.c();
    			t3 = space();
    			td2 = element("td");
    			if_block2.c();
    			t4 = space();
    			td3 = element("td");
    			if_block3.c();
    			attr_dev(th, "scope", "col");
    			attr_dev(th, "class", "pt-3");
    			add_location(th, file$4, 181, 7, 4312);
    			attr_dev(td0, "class", "pt-3");
    			add_location(td0, file$4, 185, 7, 4385);
    			attr_dev(td1, "class", "pt-3");
    			add_location(td1, file$4, 211, 7, 5220);
    			attr_dev(td2, "class", "pt-3");
    			add_location(td2, file$4, 257, 7, 6742);
    			add_location(td3, file$4, 265, 7, 6971);
    			add_location(tr, file$4, 180, 6, 4299);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, th);
    			append_dev(th, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td0);
    			if (if_block0) if_block0.m(td0, null);
    			append_dev(tr, t2);
    			append_dev(tr, td1);
    			if (if_block1) if_block1.m(td1, null);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			if_block2.m(td2, null);
    			append_dev(tr, t4);
    			append_dev(tr, td3);
    			if_block3.m(td3, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*linksData*/ 4 && t0_value !== (t0_value = /*link*/ ctx[43][0] + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(td0, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type_1 && current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(td1, null);
    				}
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_3(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(td2, null);
    				}
    			}

    			if (current_block_type_3 === (current_block_type_3 = select_block_type_4(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if_block3.d(1);
    				if_block3 = current_block_type_3(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(td3, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);

    			if (if_block0) {
    				if_block0.d();
    			}

    			if (if_block1) {
    				if_block1.d();
    			}

    			if_block2.d();
    			if_block3.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$3.name,
    		type: "each",
    		source: "(180:5) {#each linksData as link}",
    		ctx
    	});

    	return block;
    }

    // (323:40) 
    function create_if_block_1$2(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*categoriesData*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "form-select-sm form-control");
    			if (/*newDbID*/ ctx[9] === void 0) add_render_callback(() => /*select_change_handler_5*/ ctx[32].call(select));
    			add_location(select, file$4, 323, 8, 8787);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*newDbID*/ ctx[9]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_5*/ ctx[32]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*categoriesData*/ 16) {
    				each_value_1 = /*categoriesData*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*newDbID, categoriesData*/ 528) {
    				select_option(select, /*newDbID*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(323:40) ",
    		ctx
    	});

    	return block;
    }

    // (315:7) {#if newName == "/article"}
    function create_if_block$2(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*articlesData*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "form-select-sm form-control");
    			if (/*newDbID*/ ctx[9] === void 0) add_render_callback(() => /*select_change_handler_4*/ ctx[31].call(select));
    			add_location(select, file$4, 315, 8, 8491);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*newDbID*/ ctx[9]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_4*/ ctx[31]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*articlesData*/ 8) {
    				each_value = /*articlesData*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*newDbID, categoriesData*/ 528) {
    				select_option(select, /*newDbID*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(315:7) {#if newName == \\\"/article\\\"}",
    		ctx
    	});

    	return block;
    }

    // (325:9) {#each categoriesData as category}
    function create_each_block_1$3(ctx) {
    	let option;
    	let t0_value = /*category*/ ctx[40][0] + "";
    	let t0;
    	let t1;
    	let t2_value = /*category*/ ctx[40][1] + "";
    	let t2;
    	let t3;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    			t3 = space();
    			option.__value = option_value_value = /*category*/ ctx[40][0];
    			option.value = option.__value;
    			add_location(option, file$4, 325, 10, 8909);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    			append_dev(option, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*categoriesData*/ 16 && t0_value !== (t0_value = /*category*/ ctx[40][0] + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*categoriesData*/ 16 && t2_value !== (t2_value = /*category*/ ctx[40][1] + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*categoriesData*/ 16 && option_value_value !== (option_value_value = /*category*/ ctx[40][0])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(325:9) {#each categoriesData as category}",
    		ctx
    	});

    	return block;
    }

    // (317:9) {#each articlesData as article}
    function create_each_block$4(ctx) {
    	let option;
    	let t0_value = /*article*/ ctx[37][0] + "";
    	let t0;
    	let t1;
    	let t2_value = /*article*/ ctx[37][1] + "";
    	let t2;
    	let t3;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    			t3 = space();
    			option.__value = option_value_value = /*article*/ ctx[37][0];
    			option.value = option.__value;
    			add_location(option, file$4, 317, 10, 8610);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    			append_dev(option, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*articlesData*/ 8 && t0_value !== (t0_value = /*article*/ ctx[37][0] + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*articlesData*/ 8 && t2_value !== (t2_value = /*article*/ ctx[37][1] + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*articlesData*/ 8 && option_value_value !== (option_value_value = /*article*/ ctx[37][0])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(317:9) {#each articlesData as article}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let nav;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let div1;
    	let p;
    	let t4_value = (/*comp*/ ctx[1] == "header" ? `Navigation` : `Footer`) + "";
    	let t4;
    	let t5;
    	let div0;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t7;
    	let th1;
    	let t9;
    	let th2;
    	let t11;
    	let th3;
    	let t12;
    	let tbody;
    	let t13;
    	let tr1;
    	let th4;
    	let t15;
    	let td0;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let t20;
    	let td1;
    	let t21;
    	let td2;
    	let input;
    	let t22;
    	let td3;
    	let button2;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*linksData*/ ctx[2];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$3(get_each_context_2$3(ctx, each_value_2, i));
    	}

    	function select_block_type_5(ctx, dirty) {
    		if (/*newName*/ ctx[8] == "/article") return create_if_block$2;
    		if (/*newName*/ ctx[8] == "/category") return create_if_block_1$2;
    	}

    	let current_block_type = select_block_type_5(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			nav = element("nav");
    			button0 = element("button");
    			button0.textContent = "Navigation";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Footer";
    			t3 = space();
    			div1 = element("div");
    			p = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			div0 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "ID";
    			t7 = space();
    			th1 = element("th");
    			th1.textContent = "Strona docelowa";
    			t9 = space();
    			th2 = element("th");
    			th2.textContent = "Tekst";
    			t11 = space();
    			th3 = element("th");
    			t12 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			tr1 = element("tr");
    			th4 = element("th");
    			th4.textContent = "Nowy";
    			t15 = space();
    			td0 = element("td");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Strona główna";
    			option1 = element("option");
    			option1.textContent = "Strona artykułów";
    			option2 = element("option");
    			option2.textContent = "Artykuł";
    			option3 = element("option");
    			option3.textContent = "Kategoria";
    			t20 = space();
    			td1 = element("td");
    			if (if_block) if_block.c();
    			t21 = space();
    			td2 = element("td");
    			input = element("input");
    			t22 = space();
    			td3 = element("td");
    			button2 = element("button");
    			button2.textContent = "Dodaj";
    			attr_dev(button0, "class", "nav-link active");
    			attr_dev(button0, "data-bs-toggle", "tab");
    			add_location(button0, file$4, 149, 2, 3531);
    			attr_dev(button1, "class", "nav-link");
    			attr_dev(button1, "data-bs-toggle", "tab");
    			add_location(button1, file$4, 157, 2, 3683);
    			attr_dev(nav, "class", "nav nav-pills justify-content-start flex-column flex-md-row mb-3 mx-3");
    			add_location(nav, file$4, 148, 1, 3444);
    			attr_dev(p, "class", "h1 mb-3");
    			add_location(p, file$4, 167, 2, 3890);
    			attr_dev(th0, "scope", "column");
    			add_location(th0, file$4, 172, 6, 4063);
    			attr_dev(th1, "scope", "column");
    			attr_dev(th1, "colspan", "2");
    			add_location(th1, file$4, 173, 6, 4099);
    			attr_dev(th2, "scope", "column");
    			add_location(th2, file$4, 174, 6, 4160);
    			attr_dev(th3, "scope", "column");
    			add_location(th3, file$4, 175, 6, 4199);
    			add_location(tr0, file$4, 171, 5, 4051);
    			add_location(thead, file$4, 170, 4, 4037);
    			attr_dev(th4, "scope", "col");
    			attr_dev(th4, "class", "pt-3");
    			add_location(th4, file$4, 295, 6, 7889);
    			option0.__value = "/";
    			option0.value = option0.__value;
    			add_location(option0, file$4, 306, 8, 8178);
    			option1.__value = "/allArticles";
    			option1.value = option1.__value;
    			add_location(option1, file$4, 307, 8, 8228);
    			option2.__value = "/article";
    			option2.value = option2.__value;
    			add_location(option2, file$4, 308, 8, 8292);
    			option3.__value = "/category";
    			option3.value = option3.__value;
    			add_location(option3, file$4, 309, 8, 8343);
    			attr_dev(select, "class", "form-select-sm form-control");
    			if (/*newName*/ ctx[8] === void 0) add_render_callback(() => /*select_change_handler_3*/ ctx[30].call(select));
    			add_location(select, file$4, 299, 7, 8013);
    			attr_dev(td0, "class", "pt-3");
    			add_location(td0, file$4, 297, 6, 7939);
    			attr_dev(td1, "class", "pt-3");
    			add_location(td1, file$4, 313, 6, 8428);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control form-control-sm mt-2");
    			add_location(input, file$4, 333, 7, 9085);
    			add_location(td2, file$4, 332, 6, 9072);
    			attr_dev(button2, "class", "btn btn-sm btn-success my-2");
    			add_location(button2, file$4, 336, 7, 9203);
    			add_location(td3, file$4, 335, 6, 9190);
    			add_location(tr1, file$4, 294, 5, 7877);
    			add_location(tbody, file$4, 178, 4, 4252);
    			attr_dev(table, "class", "table table-striped");
    			add_location(table, file$4, 169, 3, 3996);
    			attr_dev(div0, "class", "container col-10");
    			add_location(div0, file$4, 168, 2, 3961);
    			attr_dev(div1, "class", "tab-pane container active");
    			attr_dev(div1, "id", "links-nav");
    			add_location(div1, file$4, 166, 1, 3832);
    			attr_dev(div2, "class", "tab-pane container");
    			attr_dev(div2, "id", "links");
    			add_location(div2, file$4, 147, 0, 3398);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, nav);
    			append_dev(nav, button0);
    			append_dev(nav, t1);
    			append_dev(nav, button1);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(p, t4);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			append_dev(div0, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t7);
    			append_dev(tr0, th1);
    			append_dev(tr0, t9);
    			append_dev(tr0, th2);
    			append_dev(tr0, t11);
    			append_dev(tr0, th3);
    			append_dev(table, t12);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(tbody, t13);
    			append_dev(tbody, tr1);
    			append_dev(tr1, th4);
    			append_dev(tr1, t15);
    			append_dev(tr1, td0);
    			append_dev(td0, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			select_option(select, /*newName*/ ctx[8]);
    			append_dev(tr1, t20);
    			append_dev(tr1, td1);
    			if (if_block) if_block.m(td1, null);
    			append_dev(tr1, t21);
    			append_dev(tr1, td2);
    			append_dev(td2, input);
    			set_input_value(input, /*newText*/ ctx[10]);
    			append_dev(tr1, t22);
    			append_dev(tr1, td3);
    			append_dev(td3, button2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[15], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[16], false, false, false),
    					listen_dev(select, "change", /*change_handler_1*/ ctx[29], false, false, false),
    					listen_dev(select, "change", /*select_change_handler_3*/ ctx[30]),
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[33]),
    					listen_dev(button2, "click", /*addLink*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*comp*/ 2 && t4_value !== (t4_value = (/*comp*/ ctx[1] == "header" ? `Navigation` : `Footer`) + "")) set_data_dev(t4, t4_value);

    			if (dirty[0] & /*currentlyEdited, editedName, editedDbID, editedText, saveLink, linksData, deleteLink, articlesData, categoriesData*/ 26876) {
    				each_value_2 = /*linksData*/ ctx[2];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$3(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, t13);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty[0] & /*newName*/ 256) {
    				select_option(select, /*newName*/ ctx[8]);
    			}

    			if (current_block_type === (current_block_type = select_block_type_5(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(td1, null);
    				}
    			}

    			if (dirty[0] & /*newText*/ 1024 && input.value !== /*newText*/ ctx[10]) {
    				set_input_value(input, /*newText*/ ctx[10]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);

    			if (if_block) {
    				if_block.d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let comp = "header";
    	let linksData = [];
    	let articlesData = [];
    	let categoriesData = [];
    	let editedName = "";
    	let editedDbID = 0;
    	let editedText = "";
    	let newName = "/";
    	let newDbID = 1;
    	let newText = "";
    	let currentlyEdited = 0;

    	const getLinksData = async () => {
    		await fetch("http://localhost:5000/adminGetNavLinks", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({ component: comp })
    		}).then(response => response.json()).then(data => {
    			$$invalidate(2, linksData = data.map(elem => {
    				let id = elem[0];

    				let name = elem[1].indexOf("?") == -1
    				? elem[1]
    				: elem[1].substring(0, elem[1].indexOf("?"));

    				let dbId = elem[1].indexOf("=") == -1
    				? ""
    				: elem[1].substring(elem[1].indexOf("=") + 1);

    				if (dbId != "") {
    					dbId = parseInt(dbId);
    				}

    				let text = elem[2];
    				return [id, name, dbId, text];
    			}));
    		});
    	};

    	const getArticlesData = async () => {
    		fetch("http://localhost:5000/adminGetAllArticles", { method: "POST" }).then(response => response.json()).then(data => {
    			$$invalidate(3, articlesData = data);
    		});
    	};

    	const getCategoriesData = async () => {
    		fetch("http://localhost:5000/adminGetAllCategories", { method: "POST" }).then(response => response.json()).then(data => {
    			$$invalidate(4, categoriesData = data);
    		});
    	};

    	const addLink = () => {
    		let link = "";

    		if (newName == "/" || newName == "/allArticles") {
    			link = newName;
    		} else {
    			link = `${newName}?id=${newDbID}`;
    		}

    		fetch("http://localhost:5000/adminAddNavLink", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({ link, text: newText, component: comp })
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getLinksData();
    				$$invalidate(8, newName = "/");
    				$$invalidate(9, newDbID = 1);
    				$$invalidate(10, newText = "");
    			}
    		});
    	};

    	const saveLink = () => {
    		let link = "";

    		if (editedName == "/" || editedName == "/allArticles") {
    			link = editedName;
    		} else {
    			link = `${editedName}?id=${editedDbID}`;
    		}

    		fetch("http://localhost:5000/adminSaveNavLink", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				id: currentlyEdited,
    				link,
    				text: editedText,
    				component: comp
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getLinksData();
    				$$invalidate(11, currentlyEdited = 0);
    				$$invalidate(5, editedName = "");
    				$$invalidate(6, editedDbID = 0);
    				$$invalidate(7, editedText = "");
    			}
    		});
    	};

    	const deleteLink = id => {
    		fetch("http://localhost:5000/adminDeleteNavLink", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({ id })
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getLinksData();
    			}
    		});
    	};

    	const init = () => {
    		getLinksData();
    		getArticlesData();
    		getCategoriesData();
    		$$invalidate(2, linksData = []);
    		$$invalidate(3, articlesData = []);
    		$$invalidate(4, categoriesData = []);
    		$$invalidate(5, editedName = "");
    		$$invalidate(6, editedDbID = 0);
    		$$invalidate(7, editedText = "");
    		$$invalidate(8, newName = "/");
    		$$invalidate(9, newDbID = 1);
    		$$invalidate(10, newText = "");
    		$$invalidate(11, currentlyEdited = 0);
    	};

    	init();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AdminLinks> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AdminLinks", $$slots, []);

    	const click_handler = () => {
    		$$invalidate(1, comp = "header");
    		init();
    	};

    	const click_handler_1 = () => {
    		$$invalidate(1, comp = "footer");
    		init();
    	};

    	const change_handler = () => {
    		$$invalidate(6, editedDbID = 1);
    	};

    	function select_change_handler() {
    		editedName = select_value(this);
    		$$invalidate(5, editedName);
    	}

    	function select_change_handler_1() {
    		editedDbID = select_value(this);
    		$$invalidate(6, editedDbID);
    		$$invalidate(4, categoriesData);
    	}

    	function select_change_handler_2() {
    		editedDbID = select_value(this);
    		$$invalidate(6, editedDbID);
    		$$invalidate(4, categoriesData);
    	}

    	const func = (link, elem) => {
    		return elem[0] == parseInt(link[2]);
    	};

    	const func_1 = (link, elem) => {
    		return elem[0] == parseInt(link[2]);
    	};

    	const func_2 = (link, elem) => {
    		return elem[0] == parseInt(link[2]);
    	};

    	const func_3 = (link, elem) => {
    		return elem[0] == parseInt(link[2]);
    	};

    	function input_input_handler() {
    		editedText = this.value;
    		$$invalidate(7, editedText);
    	}

    	const click_handler_2 = () => {
    		$$invalidate(11, currentlyEdited = 0);
    		$$invalidate(5, editedName = "");
    		$$invalidate(6, editedDbID = 0);
    		$$invalidate(7, editedText = "");
    	};

    	const click_handler_3 = link => {
    		$$invalidate(11, currentlyEdited = link[0]);
    		$$invalidate(5, editedName = link[1]);
    		$$invalidate(6, editedDbID = link[2]);
    		$$invalidate(7, editedText = link[3]);
    	};

    	const click_handler_4 = link => deleteLink(link[0]);

    	const change_handler_1 = () => {
    		$$invalidate(9, newDbID = 1);
    	};

    	function select_change_handler_3() {
    		newName = select_value(this);
    		$$invalidate(8, newName);
    	}

    	function select_change_handler_4() {
    		newDbID = select_value(this);
    		$$invalidate(9, newDbID);
    		$$invalidate(4, categoriesData);
    	}

    	function select_change_handler_5() {
    		newDbID = select_value(this);
    		$$invalidate(9, newDbID);
    		$$invalidate(4, categoriesData);
    	}

    	function input_input_handler_1() {
    		newText = this.value;
    		$$invalidate(10, newText);
    	}

    	$$self.$capture_state = () => ({
    		comp,
    		linksData,
    		articlesData,
    		categoriesData,
    		editedName,
    		editedDbID,
    		editedText,
    		newName,
    		newDbID,
    		newText,
    		currentlyEdited,
    		getLinksData,
    		getArticlesData,
    		getCategoriesData,
    		addLink,
    		saveLink,
    		deleteLink,
    		init
    	});

    	$$self.$inject_state = $$props => {
    		if ("comp" in $$props) $$invalidate(1, comp = $$props.comp);
    		if ("linksData" in $$props) $$invalidate(2, linksData = $$props.linksData);
    		if ("articlesData" in $$props) $$invalidate(3, articlesData = $$props.articlesData);
    		if ("categoriesData" in $$props) $$invalidate(4, categoriesData = $$props.categoriesData);
    		if ("editedName" in $$props) $$invalidate(5, editedName = $$props.editedName);
    		if ("editedDbID" in $$props) $$invalidate(6, editedDbID = $$props.editedDbID);
    		if ("editedText" in $$props) $$invalidate(7, editedText = $$props.editedText);
    		if ("newName" in $$props) $$invalidate(8, newName = $$props.newName);
    		if ("newDbID" in $$props) $$invalidate(9, newDbID = $$props.newDbID);
    		if ("newText" in $$props) $$invalidate(10, newText = $$props.newText);
    		if ("currentlyEdited" in $$props) $$invalidate(11, currentlyEdited = $$props.currentlyEdited);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		init,
    		comp,
    		linksData,
    		articlesData,
    		categoriesData,
    		editedName,
    		editedDbID,
    		editedText,
    		newName,
    		newDbID,
    		newText,
    		currentlyEdited,
    		addLink,
    		saveLink,
    		deleteLink,
    		click_handler,
    		click_handler_1,
    		change_handler,
    		select_change_handler,
    		select_change_handler_1,
    		select_change_handler_2,
    		func,
    		func_1,
    		func_2,
    		func_3,
    		input_input_handler,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		change_handler_1,
    		select_change_handler_3,
    		select_change_handler_4,
    		select_change_handler_5,
    		input_input_handler_1
    	];
    }

    class AdminLinks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { init: 0 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AdminLinks",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get init() {
    		return this.$$.ctx[0];
    	}

    	set init(value) {
    		throw new Error("<AdminLinks>: Cannot set read-only property 'init'");
    	}
    }

    /* src\adminSliders.svelte generated by Svelte v3.24.1 */

    const { console: console_1$1 } = globals;
    const file$5 = "src\\adminSliders.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	return child_ctx;
    }

    function get_each_context_3$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	return child_ctx;
    }

    function get_each_context_4$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[49] = list[i];
    	child_ctx[51] = i;
    	return child_ctx;
    }

    // (197:5) {#each slidersData as slider, idx}
    function create_each_block_4$1(ctx) {
    	let option;

    	let t0_value = (/*slider*/ ctx[49][0] == 0
    	? "*NOWY*"
    	: `${/*slider*/ ctx[49][0]} - ${/*slider*/ ctx[49][1]}`) + "";

    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*idx*/ ctx[51];
    			option.value = option.__value;
    			add_location(option, file$5, 197, 6, 4982);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*slidersData*/ 1 && t0_value !== (t0_value = (/*slider*/ ctx[49][0] == 0
    			? "*NOWY*"
    			: `${/*slider*/ ctx[49][0]} - ${/*slider*/ ctx[49][1]}`) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4$1.name,
    		type: "each",
    		source: "(197:5) {#each slidersData as slider, idx}",
    		ctx
    	});

    	return block;
    }

    // (216:3) {#if id != 0}
    function create_if_block$3(ctx) {
    	let div;
    	let span;
    	let t1;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t3;
    	let th1;
    	let t5;
    	let th2;
    	let t7;
    	let th3;
    	let t9;
    	let th4;
    	let t10;
    	let tbody;
    	let t11;
    	let tr1;
    	let th5;
    	let t13;
    	let td0;
    	let select;
    	let t14;
    	let td1;
    	let input0;
    	let t15;
    	let td2;
    	let input1;
    	let t16;
    	let td3;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*slides*/ ctx[5];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2$4(get_each_context_2$4(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*sliderImages*/ ctx[14];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Slajdy";
    			t1 = space();
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "ID";
    			t3 = space();
    			th1 = element("th");
    			th1.textContent = "Obraz";
    			t5 = space();
    			th2 = element("th");
    			th2.textContent = "Tytuł";
    			t7 = space();
    			th3 = element("th");
    			th3.textContent = "Podtytuł";
    			t9 = space();
    			th4 = element("th");
    			t10 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t11 = space();
    			tr1 = element("tr");
    			th5 = element("th");
    			th5.textContent = "Nowy";
    			t13 = space();
    			td0 = element("td");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t14 = space();
    			td1 = element("td");
    			input0 = element("input");
    			t15 = space();
    			td2 = element("td");
    			input1 = element("input");
    			t16 = space();
    			td3 = element("td");
    			button = element("button");
    			button.textContent = "Dodaj";
    			attr_dev(span, "class", "form-label");
    			add_location(span, file$5, 217, 5, 5899);
    			attr_dev(th0, "scope", "column");
    			add_location(th0, file$5, 221, 8, 6017);
    			attr_dev(th1, "scope", "column");
    			add_location(th1, file$5, 222, 8, 6055);
    			attr_dev(th2, "scope", "column");
    			add_location(th2, file$5, 223, 8, 6096);
    			attr_dev(th3, "scope", "column");
    			add_location(th3, file$5, 224, 8, 6137);
    			attr_dev(th4, "scope", "column");
    			add_location(th4, file$5, 225, 8, 6181);
    			add_location(tr0, file$5, 220, 7, 6003);
    			add_location(thead, file$5, 219, 6, 5987);
    			attr_dev(th5, "scope", "row");
    			attr_dev(th5, "class", "pt-3");
    			add_location(th5, file$5, 294, 8, 8227);
    			attr_dev(select, "class", "form-control form-select-sm");
    			if (/*newImagePath*/ ctx[10] === void 0) add_render_callback(() => /*select_change_handler_2*/ ctx[33].call(select));
    			add_location(select, file$5, 296, 9, 8305);
    			attr_dev(td0, "class", "pt-3");
    			add_location(td0, file$5, 295, 8, 8277);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control form-control-sm");
    			add_location(input0, file$5, 305, 9, 8586);
    			attr_dev(td1, "class", "pt-3");
    			add_location(td1, file$5, 304, 8, 8558);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control form-control-sm");
    			add_location(input1, file$5, 308, 9, 8719);
    			attr_dev(td2, "class", "pt-3");
    			add_location(td2, file$5, 307, 8, 8691);
    			attr_dev(button, "class", "btn btn-sm btn-success my-2");
    			add_location(button, file$5, 311, 9, 8842);
    			add_location(td3, file$5, 310, 8, 8827);
    			add_location(tr1, file$5, 293, 7, 8213);
    			add_location(tbody, file$5, 228, 6, 6240);
    			attr_dev(table, "class", "table table-striped");
    			add_location(table, file$5, 218, 5, 5944);
    			attr_dev(div, "class", "container col-12 my-4");
    			add_location(div, file$5, 216, 4, 5857);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);
    			append_dev(div, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t3);
    			append_dev(tr0, th1);
    			append_dev(tr0, t5);
    			append_dev(tr0, th2);
    			append_dev(tr0, t7);
    			append_dev(tr0, th3);
    			append_dev(tr0, t9);
    			append_dev(tr0, th4);
    			append_dev(table, t10);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tbody, null);
    			}

    			append_dev(tbody, t11);
    			append_dev(tbody, tr1);
    			append_dev(tr1, th5);
    			append_dev(tr1, t13);
    			append_dev(tr1, td0);
    			append_dev(td0, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*newImagePath*/ ctx[10]);
    			append_dev(tr1, t14);
    			append_dev(tr1, td1);
    			append_dev(td1, input0);
    			set_input_value(input0, /*newTitle*/ ctx[11]);
    			append_dev(tr1, t15);
    			append_dev(tr1, td2);
    			append_dev(td2, input1);
    			set_input_value(input1, /*newSubtitle*/ ctx[12]);
    			append_dev(tr1, t16);
    			append_dev(tr1, td3);
    			append_dev(td3, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler_2*/ ctx[33]),
    					listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[34]),
    					listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[35]),
    					listen_dev(button, "click", /*addSlide*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentlyEdited, editedImagePath, saveSlide, slides, deleteSlide, editedTitle, editedSubtitle, sliderImages*/ 1328096) {
    				each_value_2 = /*slides*/ ctx[5];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$4(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2$4(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tbody, t11);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty[0] & /*sliderImages*/ 16384) {
    				each_value_1 = /*sliderImages*/ ctx[14];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*newImagePath, sliderImages*/ 17408) {
    				select_option(select, /*newImagePath*/ ctx[10]);
    			}

    			if (dirty[0] & /*newTitle*/ 2048 && input0.value !== /*newTitle*/ ctx[11]) {
    				set_input_value(input0, /*newTitle*/ ctx[11]);
    			}

    			if (dirty[0] & /*newSubtitle*/ 4096 && input1.value !== /*newSubtitle*/ ctx[12]) {
    				set_input_value(input1, /*newSubtitle*/ ctx[12]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(216:3) {#if id != 0}",
    		ctx
    	});

    	return block;
    }

    // (245:10) {:else}
    function create_else_block_3(ctx) {
    	let t_value = /*slide*/ ctx[44][2] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*slides*/ 32 && t_value !== (t_value = /*slide*/ ctx[44][2] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(245:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (237:10) {#if slide[0] == currentlyEdited}
    function create_if_block_4$1(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*sliderImages*/ ctx[14];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3$2(get_each_context_3$2(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "form-control form-select-sm");
    			if (/*editedImagePath*/ ctx[7] === void 0) add_render_callback(() => /*select_change_handler_1*/ ctx[27].call(select));
    			add_location(select, file$5, 237, 11, 6459);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*editedImagePath*/ ctx[7]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_1*/ ctx[27]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sliderImages*/ 16384) {
    				each_value_3 = /*sliderImages*/ ctx[14];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$2(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}

    			if (dirty[0] & /*editedImagePath, sliderImages*/ 16512) {
    				select_option(select, /*editedImagePath*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(237:10) {#if slide[0] == currentlyEdited}",
    		ctx
    	});

    	return block;
    }

    // (239:12) {#each sliderImages as image}
    function create_each_block_3$2(ctx) {
    	let option;
    	let t0_value = /*image*/ ctx[39] + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*image*/ ctx[39];
    			option.value = option.__value;
    			add_location(option, file$5, 239, 13, 6590);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sliderImages*/ 16384 && t0_value !== (t0_value = /*image*/ ctx[39] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*sliderImages*/ 16384 && option_value_value !== (option_value_value = /*image*/ ctx[39])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3$2.name,
    		type: "each",
    		source: "(239:12) {#each sliderImages as image}",
    		ctx
    	});

    	return block;
    }

    // (253:10) {:else}
    function create_else_block_2(ctx) {
    	let t_value = /*slide*/ ctx[44][4] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*slides*/ 32 && t_value !== (t_value = /*slide*/ ctx[44][4] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(253:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (251:10) {#if slide[0] == currentlyEdited}
    function create_if_block_3$1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control form-control-sm");
    			add_location(input, file$5, 251, 11, 6865);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*editedTitle*/ ctx[8]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[28]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*editedTitle*/ 256 && input.value !== /*editedTitle*/ ctx[8]) {
    				set_input_value(input, /*editedTitle*/ ctx[8]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(251:10) {#if slide[0] == currentlyEdited}",
    		ctx
    	});

    	return block;
    }

    // (261:10) {:else}
    function create_else_block_1$3(ctx) {
    	let t_value = /*slide*/ ctx[44][5] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*slides*/ 32 && t_value !== (t_value = /*slide*/ ctx[44][5] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$3.name,
    		type: "else",
    		source: "(261:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (259:10) {#if slide[0] == currentlyEdited}
    function create_if_block_2$2(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control form-control-sm");
    			add_location(input, file$5, 259, 11, 7111);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*editedSubtitle*/ ctx[9]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[29]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*editedSubtitle*/ 512 && input.value !== /*editedSubtitle*/ ctx[9]) {
    				set_input_value(input, /*editedSubtitle*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(259:10) {#if slide[0] == currentlyEdited}",
    		ctx
    	});

    	return block;
    }

    // (276:10) {:else}
    function create_else_block$3(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[31](/*slide*/ ctx[44], ...args);
    	}

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[32](/*slide*/ ctx[44], ...args);
    	}

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Edytuj";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Usuń";
    			attr_dev(button0, "class", "btn btn-sm btn-primary my-1");
    			add_location(button0, file$5, 276, 11, 7695);
    			attr_dev(button1, "class", "btn btn-sm btn-outline-danger ms-3 my-1");
    			add_location(button1, file$5, 285, 11, 8003);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler_1, false, false, false),
    					listen_dev(button1, "click", click_handler_2, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(276:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (267:10) {#if slide[0] == currentlyEdited}
    function create_if_block_1$3(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Zapisz";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Anuluj";
    			attr_dev(button0, "class", "btn btn-sm btn-outline-primary my-1");
    			add_location(button0, file$5, 267, 11, 7347);
    			attr_dev(button1, "class", "btn btn-sm btn-outline-danger ms-3 my-1");
    			add_location(button1, file$5, 268, 11, 7448);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*saveSlide*/ ctx[18], false, false, false),
    					listen_dev(button1, "click", /*click_handler*/ ctx[30], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(267:10) {#if slide[0] == currentlyEdited}",
    		ctx
    	});

    	return block;
    }

    // (230:7) {#each slides as slide}
    function create_each_block_2$4(ctx) {
    	let tr;
    	let th;
    	let t0_value = /*slide*/ ctx[44][0] + "";
    	let t0;
    	let t1;
    	let td0;
    	let t2;
    	let td1;
    	let t3;
    	let td2;
    	let t4;
    	let td3;

    	function select_block_type(ctx, dirty) {
    		if (/*slide*/ ctx[44][0] == /*currentlyEdited*/ ctx[6]) return create_if_block_4$1;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*slide*/ ctx[44][0] == /*currentlyEdited*/ ctx[6]) return create_if_block_3$1;
    		return create_else_block_2;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*slide*/ ctx[44][0] == /*currentlyEdited*/ ctx[6]) return create_if_block_2$2;
    		return create_else_block_1$3;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_2(ctx);

    	function select_block_type_3(ctx, dirty) {
    		if (/*slide*/ ctx[44][0] == /*currentlyEdited*/ ctx[6]) return create_if_block_1$3;
    		return create_else_block$3;
    	}

    	let current_block_type_3 = select_block_type_3(ctx);
    	let if_block3 = current_block_type_3(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			td0 = element("td");
    			if_block0.c();
    			t2 = space();
    			td1 = element("td");
    			if_block1.c();
    			t3 = space();
    			td2 = element("td");
    			if_block2.c();
    			t4 = space();
    			td3 = element("td");
    			if_block3.c();
    			attr_dev(th, "scope", "col");
    			attr_dev(th, "class", "pt-3");
    			add_location(th, file$5, 231, 9, 6304);
    			attr_dev(td0, "class", "pt-3");
    			add_location(td0, file$5, 235, 9, 6384);
    			attr_dev(td1, "class", "pt-3");
    			add_location(td1, file$5, 249, 9, 6790);
    			attr_dev(td2, "class", "pt-3");
    			add_location(td2, file$5, 257, 9, 7036);
    			add_location(td3, file$5, 265, 9, 7285);
    			add_location(tr, file$5, 230, 8, 6289);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, th);
    			append_dev(th, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td0);
    			if_block0.m(td0, null);
    			append_dev(tr, t2);
    			append_dev(tr, td1);
    			if_block1.m(td1, null);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			if_block2.m(td2, null);
    			append_dev(tr, t4);
    			append_dev(tr, td3);
    			if_block3.m(td3, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*slides*/ 32 && t0_value !== (t0_value = /*slide*/ ctx[44][0] + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(td0, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(td1, null);
    				}
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_2(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(td2, null);
    				}
    			}

    			if (current_block_type_3 === (current_block_type_3 = select_block_type_3(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if_block3.d(1);
    				if_block3 = current_block_type_3(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(td3, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_block0.d();
    			if_block1.d();
    			if_block2.d();
    			if_block3.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$4.name,
    		type: "each",
    		source: "(230:7) {#each slides as slide}",
    		ctx
    	});

    	return block;
    }

    // (298:10) {#each sliderImages as image}
    function create_each_block_1$4(ctx) {
    	let option;
    	let t0_value = /*image*/ ctx[39] + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*image*/ ctx[39];
    			option.value = option.__value;
    			add_location(option, file$5, 298, 11, 8429);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sliderImages*/ 16384 && t0_value !== (t0_value = /*image*/ ctx[39] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*sliderImages*/ 16384 && option_value_value !== (option_value_value = /*image*/ ctx[39])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(298:10) {#each sliderImages as image}",
    		ctx
    	});

    	return block;
    }

    // (337:6) {#each sliderImages as image}
    function create_each_block$5(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*image*/ ctx[39] + "";
    	let t0;
    	let t1;
    	let td1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			img = element("img");
    			t2 = space();
    			attr_dev(td0, "class", "text-center fw-bold");
    			add_location(td0, file$5, 338, 8, 9687);
    			attr_dev(img, "class", "img-preview");
    			if (img.src !== (img_src_value = `http://localhost:5000/uploads/slider/${/*image*/ ctx[39]}`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*image*/ ctx[39]);
    			add_location(img, file$5, 340, 9, 9780);
    			attr_dev(td1, "class", "text-start lh-1");
    			add_location(td1, file$5, 339, 8, 9741);
    			add_location(tr, file$5, 337, 7, 9673);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, img);
    			append_dev(tr, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sliderImages*/ 16384 && t0_value !== (t0_value = /*image*/ ctx[39] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*sliderImages*/ 16384 && img.src !== (img_src_value = `http://localhost:5000/uploads/slider/${/*image*/ ctx[39]}`)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*sliderImages*/ 16384 && img_alt_value !== (img_alt_value = /*image*/ ctx[39])) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(337:6) {#each sliderImages as image}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div7;
    	let nav;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let div6;
    	let div2;
    	let p0;
    	let t5;
    	let div0;
    	let select;
    	let t6;
    	let button0;
    	let span0;
    	let t8;
    	let button1;
    	let span1;
    	let t10;
    	let div1;
    	let label0;
    	let t12;
    	let input0;
    	let t13;
    	let label1;
    	let t15;
    	let input1;
    	let t16;
    	let button2;
    	let t18;
    	let t19;
    	let div5;
    	let p1;
    	let t21;
    	let div3;
    	let input2;
    	let t22;
    	let button3;
    	let t24;
    	let div4;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t26;
    	let th1;
    	let t28;
    	let tbody;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*slidersData*/ ctx[0];
    	validate_each_argument(each_value_4);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_1[i] = create_each_block_4$1(get_each_context_4$1(ctx, each_value_4, i));
    	}

    	let if_block = /*id*/ ctx[2] != 0 && create_if_block$3(ctx);
    	let each_value = /*sliderImages*/ ctx[14];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "Sliders";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Upload";
    			t3 = space();
    			div6 = element("div");
    			div2 = element("div");
    			p0 = element("p");
    			p0.textContent = "Sliders";
    			t5 = space();
    			div0 = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t6 = space();
    			button0 = element("button");
    			span0 = element("span");
    			span0.textContent = "+";
    			t8 = space();
    			button1 = element("button");
    			span1 = element("span");
    			span1.textContent = "×";
    			t10 = space();
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Nazwa";
    			t12 = space();
    			input0 = element("input");
    			t13 = space();
    			label1 = element("label");
    			label1.textContent = "Czas zmiany (ms)";
    			t15 = space();
    			input1 = element("input");
    			t16 = space();
    			button2 = element("button");
    			button2.textContent = "Zapisz";
    			t18 = space();
    			if (if_block) if_block.c();
    			t19 = space();
    			div5 = element("div");
    			p1 = element("p");
    			p1.textContent = "Upload";
    			t21 = space();
    			div3 = element("div");
    			input2 = element("input");
    			t22 = space();
    			button3 = element("button");
    			button3.textContent = "Wgraj";
    			t24 = space();
    			div4 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Nazwa";
    			t26 = space();
    			th1 = element("th");
    			th1.textContent = "Podgląd";
    			t28 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(a0, "href", "#sliders-composition");
    			attr_dev(a0, "class", "nav-link active");
    			attr_dev(a0, "data-bs-toggle", "tab");
    			add_location(a0, file$5, 187, 2, 4380);
    			attr_dev(a1, "href", "#sliders-images");
    			attr_dev(a1, "class", "nav-link");
    			attr_dev(a1, "data-bs-toggle", "tab");
    			add_location(a1, file$5, 188, 2, 4471);
    			attr_dev(nav, "class", "nav nav-pills justify-content-start flex-column flex-md-row mb-3 mx-3");
    			add_location(nav, file$5, 186, 1, 4293);
    			attr_dev(p0, "class", "h1 mb-3");
    			add_location(p0, file$5, 192, 3, 4655);
    			attr_dev(select, "class", "form-select-sm col-8");
    			if (/*currentID*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[24].call(select));
    			add_location(select, file$5, 195, 4, 4850);
    			attr_dev(span0, "class", "fw-bold");
    			add_location(span0, file$5, 202, 70, 5188);
    			attr_dev(button0, "class", "btn btn-sm btn-primary px-3");
    			add_location(button0, file$5, 202, 4, 5122);
    			attr_dev(span1, "class", "fw-bold");
    			add_location(span1, file$5, 203, 80, 5310);
    			attr_dev(button1, "class", "btn btn-sm btn-outline-danger px-3");
    			add_location(button1, file$5, 203, 4, 5234);
    			attr_dev(div0, "class", "container d-flex justify-content-start gap-2 align-items-center mb-3 col-sm-10 col-md-8 mx-auto");
    			add_location(div0, file$5, 193, 3, 4690);
    			attr_dev(label0, "for", "sliderName");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$5, 206, 4, 5422);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "sliderName");
    			add_location(input0, file$5, 207, 4, 5484);
    			attr_dev(label1, "for", "sliderInterval");
    			attr_dev(label1, "class", "form-label mt-3");
    			add_location(label1, file$5, 209, 4, 5568);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "sliderInterval");
    			add_location(input1, file$5, 210, 4, 5650);
    			attr_dev(button2, "class", "btn btn-primary mt-4");
    			add_location(button2, file$5, 212, 4, 5744);
    			attr_dev(div1, "class", "container col-sm-10 col-md-8 mx-auto");
    			add_location(div1, file$5, 205, 3, 5366);
    			attr_dev(div2, "class", "tab-pane container active");
    			attr_dev(div2, "id", "sliders-composition");
    			add_location(div2, file$5, 191, 2, 4586);
    			attr_dev(p1, "class", "h1 mb-3");
    			add_location(p1, file$5, 320, 3, 9073);
    			attr_dev(input2, "name", "file");
    			attr_dev(input2, "type", "file");
    			input2.multiple = true;
    			attr_dev(input2, "accept", "image/*");
    			attr_dev(input2, "class", "form-control mt-4");
    			add_location(input2, file$5, 323, 4, 9144);
    			attr_dev(button3, "type", "button");
    			attr_dev(button3, "class", "btn btn-success mt-3");
    			add_location(button3, file$5, 324, 4, 9260);
    			attr_dev(div3, "class", "container col-6");
    			add_location(div3, file$5, 322, 3, 9109);
    			attr_dev(th0, "class", "text-center");
    			attr_dev(th0, "scope", "col");
    			add_location(th0, file$5, 331, 7, 9483);
    			attr_dev(th1, "class", "text-start");
    			attr_dev(th1, "scope", "col");
    			add_location(th1, file$5, 332, 7, 9538);
    			add_location(tr, file$5, 330, 6, 9470);
    			add_location(thead, file$5, 329, 5, 9455);
    			add_location(tbody, file$5, 335, 5, 9620);
    			attr_dev(table, "class", "table table-striped");
    			add_location(table, file$5, 328, 4, 9413);
    			attr_dev(div4, "class", "container col-8 mt-4");
    			add_location(div4, file$5, 327, 3, 9373);
    			attr_dev(div5, "class", "tab-pane container");
    			attr_dev(div5, "id", "sliders-images");
    			add_location(div5, file$5, 319, 2, 9016);
    			attr_dev(div6, "class", "tab-content");
    			add_location(div6, file$5, 190, 1, 4557);
    			attr_dev(div7, "class", "tab-pane container");
    			attr_dev(div7, "id", "sliders");
    			add_location(div7, file$5, 185, 0, 4245);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, nav);
    			append_dev(nav, a0);
    			append_dev(nav, t1);
    			append_dev(nav, a1);
    			append_dev(div7, t3);
    			append_dev(div7, div6);
    			append_dev(div6, div2);
    			append_dev(div2, p0);
    			append_dev(div2, t5);
    			append_dev(div2, div0);
    			append_dev(div0, select);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, /*currentID*/ ctx[1]);
    			append_dev(div0, t6);
    			append_dev(div0, button0);
    			append_dev(button0, span0);
    			append_dev(div0, t8);
    			append_dev(div0, button1);
    			append_dev(button1, span1);
    			append_dev(div2, t10);
    			append_dev(div2, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t12);
    			append_dev(div1, input0);
    			set_input_value(input0, /*name*/ ctx[3]);
    			append_dev(div1, t13);
    			append_dev(div1, label1);
    			append_dev(div1, t15);
    			append_dev(div1, input1);
    			set_input_value(input1, /*interval*/ ctx[4]);
    			append_dev(div1, t16);
    			append_dev(div1, button2);
    			append_dev(div2, t18);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div6, t19);
    			append_dev(div6, div5);
    			append_dev(div5, p1);
    			append_dev(div5, t21);
    			append_dev(div5, div3);
    			append_dev(div3, input2);
    			append_dev(div3, t22);
    			append_dev(div3, button3);
    			append_dev(div5, t24);
    			append_dev(div5, div4);
    			append_dev(div4, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t26);
    			append_dev(tr, th1);
    			append_dev(table, t28);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[24]),
    					listen_dev(select, "change", /*changeData*/ ctx[21], false, false, false),
    					listen_dev(button0, "click", /*addSlider*/ ctx[15], false, false, false),
    					listen_dev(button1, "click", /*deleteSlider*/ ctx[17], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[25]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[26]),
    					listen_dev(button2, "click", /*saveSlider*/ ctx[16], false, false, false),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[36]),
    					listen_dev(button3, "click", /*uploadSliderImages*/ ctx[22], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*slidersData*/ 1) {
    				each_value_4 = /*slidersData*/ ctx[0];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4$1(ctx, each_value_4, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_4$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_4.length;
    			}

    			if (dirty[0] & /*currentID*/ 2) {
    				select_option(select, /*currentID*/ ctx[1]);
    			}

    			if (dirty[0] & /*name*/ 8 && input0.value !== /*name*/ ctx[3]) {
    				set_input_value(input0, /*name*/ ctx[3]);
    			}

    			if (dirty[0] & /*interval*/ 16 && to_number(input1.value) !== /*interval*/ ctx[4]) {
    				set_input_value(input1, /*interval*/ ctx[4]);
    			}

    			if (/*id*/ ctx[2] != 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*sliderImages*/ 16384) {
    				each_value = /*sliderImages*/ ctx[14];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			destroy_each(each_blocks_1, detaching);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { admTemplates } = $$props;
    	let slidersData = [];
    	let currentID = 0;
    	let id = 0;
    	let name = "";
    	let interval = 5000;
    	let slides = [];
    	let currentlyEdited = 0;
    	let editedImagePath = "";
    	let editedTitle = "";
    	let editedSubtitle = "";
    	let newImagePath = "";
    	let newTitle = "";
    	let newSubtitle = "";
    	let uploadFiles = [];
    	let sliderImages = [];

    	const getData = () => {
    		fetch("http://localhost:5000/adminGetAllSliders", { method: "POST" }).then(response => response.json()).then(data => {
    			$$invalidate(0, slidersData = data);
    			changeData();
    			getSliderImages();
    		});
    	};

    	const getSliderImages = () => {
    		fetch("http://localhost:5000/adminGetSliderImages", { method: "POST" }).then(response => response.json()).then(data => {
    			console.log(data);
    			$$invalidate(14, sliderImages = data);
    		});
    	};

    	const addSlider = () => {
    		$$invalidate(0, slidersData = [...slidersData, [0, "", 5000, []]]);
    		$$invalidate(1, currentID = slidersData.length - 1);
    		changeData();
    	};

    	const saveSlider = () => {
    		if (slidersData.length == 0) return;

    		fetch("http://localhost:5000/adminSaveSlider", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				id: slidersData[currentID][0],
    				name,
    				interval
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    				admTemplates.getData();
    			}
    		});
    	};

    	const deleteSlider = () => {
    		if (slidersData.length == 0) return;

    		if (slidersData[currentID][0] == 0) {
    			$$invalidate(0, slidersData = slidersData.filter((elem, idx) => {
    				return idx != currentID;
    			}));

    			$$invalidate(1, currentID = slidersData.length - 1);
    			changeData();
    		} else {
    			fetch("http://localhost:5000/adminDeleteSlider", {
    				method: "POST",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify({ id: slidersData[currentID][0] })
    			}).then(response => response.json()).then(data => {
    				if (data.state == "valid") {
    					$$invalidate(1, currentID = slidersData.length - 2);
    					getData();
    					admTemplates.getData();
    				}
    			});
    		}
    	};

    	const saveSlide = () => {
    		fetch("http://localhost:5000/adminSaveSlide", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				id: currentlyEdited,
    				newImagePath: editedImagePath,
    				newTitle: editedTitle,
    				newSubtitle: editedSubtitle
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    				$$invalidate(6, currentlyEdited = 0);
    				$$invalidate(7, editedImagePath = "");
    			}
    		});
    	};

    	const addSlide = () => {
    		fetch("http://localhost:5000/adminAddSlide", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				sliderID: slidersData[currentID][0],
    				imagePath: newImagePath,
    				title: newTitle,
    				subtitle: newSubtitle
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				$$invalidate(10, newImagePath = "");
    				getData();
    			}
    		});
    	};

    	const deleteSlide = id => {
    		fetch("http://localhost:5000/adminDeleteSlide", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({ id })
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    			}
    		});
    	};

    	const changeData = () => {
    		if (slidersData.length > 0) {
    			$$invalidate(2, id = slidersData[currentID][0]);
    			$$invalidate(3, name = slidersData[currentID][1]);
    			$$invalidate(4, interval = slidersData[currentID][2]);
    			$$invalidate(5, slides = slidersData[currentID][3]);
    		} else {
    			$$invalidate(2, [id, name, interval, slides] = ["", "", 5000, []], id, $$invalidate(3, name), $$invalidate(4, interval), $$invalidate(5, slides));
    		}
    	};

    	const uploadSliderImages = () => {
    		if (uploadFiles.length == 0) return;

    		for (let file of uploadFiles) {
    			let formData = new FormData();
    			formData.append("file", file);

    			fetch("http://localhost:5000/adminUploadSliderImages", { method: "POST", body: formData }).then(response => response.json()).then(() => {
    				getData();
    			});
    		}

    		$$invalidate(13, uploadFiles = []);
    	};

    	getData();
    	const writable_props = ["admTemplates"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<AdminSliders> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AdminSliders", $$slots, []);

    	function select_change_handler() {
    		currentID = select_value(this);
    		$$invalidate(1, currentID);
    	}

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(3, name);
    	}

    	function input1_input_handler() {
    		interval = to_number(this.value);
    		$$invalidate(4, interval);
    	}

    	function select_change_handler_1() {
    		editedImagePath = select_value(this);
    		$$invalidate(7, editedImagePath);
    		$$invalidate(14, sliderImages);
    	}

    	function input_input_handler() {
    		editedTitle = this.value;
    		$$invalidate(8, editedTitle);
    	}

    	function input_input_handler_1() {
    		editedSubtitle = this.value;
    		$$invalidate(9, editedSubtitle);
    	}

    	const click_handler = () => {
    		$$invalidate(6, currentlyEdited = 0);
    		$$invalidate(7, editedImagePath = "");
    	};

    	const click_handler_1 = slide => {
    		$$invalidate(6, currentlyEdited = slide[0]);
    		$$invalidate(7, editedImagePath = slide[2]);
    		$$invalidate(8, editedTitle = slide[4]);
    		$$invalidate(9, editedSubtitle = slide[5]);
    	};

    	const click_handler_2 = slide => deleteSlide(slide[0]);

    	function select_change_handler_2() {
    		newImagePath = select_value(this);
    		$$invalidate(10, newImagePath);
    		$$invalidate(14, sliderImages);
    	}

    	function input0_input_handler_1() {
    		newTitle = this.value;
    		$$invalidate(11, newTitle);
    	}

    	function input1_input_handler_1() {
    		newSubtitle = this.value;
    		$$invalidate(12, newSubtitle);
    	}

    	function input2_change_handler() {
    		uploadFiles = this.files;
    		$$invalidate(13, uploadFiles);
    	}

    	$$self.$$set = $$props => {
    		if ("admTemplates" in $$props) $$invalidate(23, admTemplates = $$props.admTemplates);
    	};

    	$$self.$capture_state = () => ({
    		admTemplates,
    		slidersData,
    		currentID,
    		id,
    		name,
    		interval,
    		slides,
    		currentlyEdited,
    		editedImagePath,
    		editedTitle,
    		editedSubtitle,
    		newImagePath,
    		newTitle,
    		newSubtitle,
    		uploadFiles,
    		sliderImages,
    		getData,
    		getSliderImages,
    		addSlider,
    		saveSlider,
    		deleteSlider,
    		saveSlide,
    		addSlide,
    		deleteSlide,
    		changeData,
    		uploadSliderImages
    	});

    	$$self.$inject_state = $$props => {
    		if ("admTemplates" in $$props) $$invalidate(23, admTemplates = $$props.admTemplates);
    		if ("slidersData" in $$props) $$invalidate(0, slidersData = $$props.slidersData);
    		if ("currentID" in $$props) $$invalidate(1, currentID = $$props.currentID);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    		if ("interval" in $$props) $$invalidate(4, interval = $$props.interval);
    		if ("slides" in $$props) $$invalidate(5, slides = $$props.slides);
    		if ("currentlyEdited" in $$props) $$invalidate(6, currentlyEdited = $$props.currentlyEdited);
    		if ("editedImagePath" in $$props) $$invalidate(7, editedImagePath = $$props.editedImagePath);
    		if ("editedTitle" in $$props) $$invalidate(8, editedTitle = $$props.editedTitle);
    		if ("editedSubtitle" in $$props) $$invalidate(9, editedSubtitle = $$props.editedSubtitle);
    		if ("newImagePath" in $$props) $$invalidate(10, newImagePath = $$props.newImagePath);
    		if ("newTitle" in $$props) $$invalidate(11, newTitle = $$props.newTitle);
    		if ("newSubtitle" in $$props) $$invalidate(12, newSubtitle = $$props.newSubtitle);
    		if ("uploadFiles" in $$props) $$invalidate(13, uploadFiles = $$props.uploadFiles);
    		if ("sliderImages" in $$props) $$invalidate(14, sliderImages = $$props.sliderImages);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		slidersData,
    		currentID,
    		id,
    		name,
    		interval,
    		slides,
    		currentlyEdited,
    		editedImagePath,
    		editedTitle,
    		editedSubtitle,
    		newImagePath,
    		newTitle,
    		newSubtitle,
    		uploadFiles,
    		sliderImages,
    		addSlider,
    		saveSlider,
    		deleteSlider,
    		saveSlide,
    		addSlide,
    		deleteSlide,
    		changeData,
    		uploadSliderImages,
    		admTemplates,
    		select_change_handler,
    		input0_input_handler,
    		input1_input_handler,
    		select_change_handler_1,
    		input_input_handler,
    		input_input_handler_1,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		select_change_handler_2,
    		input0_input_handler_1,
    		input1_input_handler_1,
    		input2_change_handler
    	];
    }

    class AdminSliders extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { admTemplates: 23 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AdminSliders",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*admTemplates*/ ctx[23] === undefined && !("admTemplates" in props)) {
    			console_1$1.warn("<AdminSliders> was created without expected prop 'admTemplates'");
    		}
    	}

    	get admTemplates() {
    		throw new Error("<AdminSliders>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set admTemplates(value) {
    		throw new Error("<AdminSliders>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\adminTemplates.svelte generated by Svelte v3.24.1 */

    const file$6 = "src\\adminTemplates.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[48] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[48] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[51] = list[i];
    	return child_ctx;
    }

    function get_each_context_3$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[56] = list[i];
    	child_ctx[58] = i;
    	return child_ctx;
    }

    // (256:3) {#each templatesData as template, idx}
    function create_each_block_3$3(ctx) {
    	let option;

    	let t0_value = (/*template*/ ctx[56][0] == 0
    	? "*NOWY*"
    	: `${/*template*/ ctx[56][0]} - ${/*template*/ ctx[56][1]}`) + "";

    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*idx*/ ctx[58];
    			option.value = option.__value;
    			add_location(option, file$6, 256, 4, 6950);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*templatesData*/ 1 && t0_value !== (t0_value = (/*template*/ ctx[56][0] == 0
    			? "*NOWY*"
    			: `${/*template*/ ctx[56][0]} - ${/*template*/ ctx[56][1]}`) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3$3.name,
    		type: "each",
    		source: "(256:3) {#each templatesData as template, idx}",
    		ctx
    	});

    	return block;
    }

    // (299:1) {#if id != 0}
    function create_if_block$4(ctx) {
    	let div;
    	let span;
    	let t1;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t3;
    	let th1;
    	let t5;
    	let th2;
    	let t7;
    	let th3;
    	let t9;
    	let th4;
    	let t10;
    	let tbody;
    	let t11;
    	let tr1;
    	let th5;
    	let t12;
    	let td0;
    	let t14;
    	let td1;
    	let select;
    	let t15;
    	let td2;
    	let input;
    	let t16;
    	let td3;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*components*/ ctx[11];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$5(get_each_context_1$5(ctx, each_value_1, i));
    	}

    	function select_block_type_4(ctx, dirty) {
    		if (/*components*/ ctx[11].length == 0) return create_if_block_1$4;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type_4(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value = /*componentsData*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Sekcje";
    			t1 = space();
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Kolejność";
    			t3 = space();
    			th1 = element("th");
    			th1.textContent = "ID";
    			t5 = space();
    			th2 = element("th");
    			th2.textContent = "Komponent";
    			t7 = space();
    			th3 = element("th");
    			th3.textContent = "Nazwa";
    			t9 = space();
    			th4 = element("th");
    			t10 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t11 = space();
    			tr1 = element("tr");
    			th5 = element("th");
    			if_block.c();
    			t12 = space();
    			td0 = element("td");
    			td0.textContent = "Nowy";
    			t14 = space();
    			td1 = element("td");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t15 = space();
    			td2 = element("td");
    			input = element("input");
    			t16 = space();
    			td3 = element("td");
    			button = element("button");
    			button.textContent = "Dodaj";
    			attr_dev(span, "class", "form-label");
    			add_location(span, file$6, 300, 3, 9061);
    			attr_dev(th0, "scope", "column");
    			add_location(th0, file$6, 304, 6, 9171);
    			attr_dev(th1, "scope", "column");
    			add_location(th1, file$6, 305, 6, 9214);
    			attr_dev(th2, "scope", "column");
    			add_location(th2, file$6, 306, 6, 9250);
    			attr_dev(th3, "scope", "column");
    			add_location(th3, file$6, 307, 6, 9293);
    			attr_dev(th4, "scope", "column");
    			add_location(th4, file$6, 308, 6, 9332);
    			add_location(tr0, file$6, 303, 5, 9159);
    			add_location(thead, file$6, 302, 4, 9145);
    			attr_dev(th5, "scope", "row");
    			attr_dev(th5, "class", "pt-3");
    			add_location(th5, file$6, 397, 6, 12075);
    			attr_dev(td0, "class", "pt-3");
    			add_location(td0, file$6, 405, 6, 12257);
    			attr_dev(select, "class", "form-control form-select-sm");
    			if (/*newComponent*/ ctx[12] === void 0) add_render_callback(() => /*select_change_handler_1*/ ctx[44].call(select));
    			add_location(select, file$6, 408, 7, 12321);
    			attr_dev(td1, "class", "pt-3");
    			add_location(td1, file$6, 407, 6, 12295);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control form-control-sm");
    			add_location(input, file$6, 418, 7, 12667);
    			attr_dev(td2, "class", "pt-3");
    			add_location(td2, file$6, 417, 6, 12641);
    			attr_dev(button, "class", "btn btn-sm btn-success my-2");
    			add_location(button, file$6, 422, 7, 12791);
    			add_location(td3, file$6, 421, 6, 12778);
    			add_location(tr1, file$6, 396, 5, 12063);
    			add_location(tbody, file$6, 311, 4, 9385);
    			attr_dev(table, "class", "table table-striped");
    			add_location(table, file$6, 301, 3, 9104);
    			attr_dev(div, "class", "container col-12 my-4");
    			add_location(div, file$6, 299, 2, 9021);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);
    			append_dev(div, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t3);
    			append_dev(tr0, th1);
    			append_dev(tr0, t5);
    			append_dev(tr0, th2);
    			append_dev(tr0, t7);
    			append_dev(tr0, th3);
    			append_dev(tr0, t9);
    			append_dev(tr0, th4);
    			append_dev(table, t10);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tbody, null);
    			}

    			append_dev(tbody, t11);
    			append_dev(tbody, tr1);
    			append_dev(tr1, th5);
    			if_block.m(th5, null);
    			append_dev(tr1, t12);
    			append_dev(tr1, td0);
    			append_dev(tr1, t14);
    			append_dev(tr1, td1);
    			append_dev(td1, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*newComponent*/ ctx[12]);
    			append_dev(tr1, t15);
    			append_dev(tr1, td2);
    			append_dev(td2, input);
    			set_input_value(input, /*newComponentName*/ ctx[13]);
    			append_dev(tr1, t16);
    			append_dev(tr1, td3);
    			append_dev(td3, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler_1*/ ctx[44]),
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[45]),
    					listen_dev(button, "click", /*addComponent*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentlyEdited, saveComponent, components, deleteComponent, editedComponent, editedComponentName, componentsData, orderDown, orderUp*/ 31574018) {
    				each_value_1 = /*components*/ ctx[11];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$5(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$5(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tbody, t11);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(th5, null);
    				}
    			}

    			if (dirty[0] & /*componentsData*/ 2) {
    				each_value = /*componentsData*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*newComponent, componentsData*/ 4098) {
    				select_option(select, /*newComponent*/ ctx[12]);
    			}

    			if (dirty[0] & /*newComponentName*/ 8192 && input.value !== /*newComponentName*/ ctx[13]) {
    				set_input_value(input, /*newComponentName*/ ctx[13]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks_1, detaching);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(299:1) {#if id != 0}",
    		ctx
    	});

    	return block;
    }

    // (331:8) {:else}
    function create_else_block_4(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[37](/*component*/ ctx[51], ...args);
    	}

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[38](/*component*/ ctx[51], ...args);
    	}

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "▲";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "▼";
    			attr_dev(button0, "class", "btn btn-sm btn-primary px-1 py-0 ms-2");
    			add_location(button0, file$6, 331, 9, 9991);
    			attr_dev(button1, "class", "btn btn-sm btn-primary px-1 py-0");
    			add_location(button1, file$6, 337, 9, 10175);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler_2, false, false, false),
    					listen_dev(button1, "click", click_handler_3, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(331:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (324:52) 
    function create_if_block_6$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[36](/*component*/ ctx[51], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "▲";
    			attr_dev(button, "class", "btn btn-sm btn-primary px-1 py-0 ms-2");
    			add_location(button, file$6, 324, 9, 9790);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(324:52) ",
    		ctx
    	});

    	return block;
    }

    // (317:8) {#if component[3] == 1}
    function create_if_block_5$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[35](/*component*/ ctx[51], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "▼";
    			attr_dev(button, "class", "btn btn-sm btn-primary px-1 py-0 m-left");
    			add_location(button, file$6, 317, 9, 9548);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(317:8) {#if component[3] == 1}",
    		ctx
    	});

    	return block;
    }

    // (357:8) {:else}
    function create_else_block_3$1(ctx) {
    	let t0_value = /*component*/ ctx[51][1] + "";
    	let t0;

    	let t1_value = (/*component*/ ctx[51][2] == 0
    	? ``
    	: `, id: ${/*component*/ ctx[51][2]}`) + "";

    	let t1;
    	let t2;
    	let t3_value = /*component*/ ctx[51][5] + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(t1_value);
    			t2 = text(" (");
    			t3 = text(t3_value);
    			t4 = text(")");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*components*/ 2048 && t0_value !== (t0_value = /*component*/ ctx[51][1] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*components*/ 2048 && t1_value !== (t1_value = (/*component*/ ctx[51][2] == 0
    			? ``
    			: `, id: ${/*component*/ ctx[51][2]}`) + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*components*/ 2048 && t3_value !== (t3_value = /*component*/ ctx[51][5] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(t4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3$1.name,
    		type: "else",
    		source: "(357:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (349:8) {#if component[6] == currentlyEdited}
    function create_if_block_4$2(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*componentsData*/ ctx[1];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$5(get_each_context_2$5(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "form-control form-select-sm");
    			if (/*editedComponent*/ ctx[14] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[39].call(select));
    			add_location(select, file$6, 349, 9, 10493);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*editedComponent*/ ctx[14]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[39]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*componentsData*/ 2) {
    				each_value_2 = /*componentsData*/ ctx[1];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$5(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty[0] & /*editedComponent, componentsData*/ 16386) {
    				select_option(select, /*editedComponent*/ ctx[14]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(349:8) {#if component[6] == currentlyEdited}",
    		ctx
    	});

    	return block;
    }

    // (351:10) {#each componentsData as compData}
    function create_each_block_2$5(ctx) {
    	let option;
    	let t0_value = /*compData*/ ctx[48][1] + "";
    	let t0;

    	let t1_value = (/*compData*/ ctx[48][2] == 0
    	? ``
    	: `, id: ${/*compData*/ ctx[48][2]}`) + "";

    	let t1;
    	let t2;
    	let t3_value = /*compData*/ ctx[48][3] + "";
    	let t3;
    	let t4;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text(t1_value);
    			t2 = text(" (");
    			t3 = text(t3_value);
    			t4 = text(")\r\n\t\t\t\t\t\t\t\t\t\t\t");
    			option.__value = option_value_value = /*compData*/ ctx[48][0];
    			option.value = option.__value;
    			add_location(option, file$6, 351, 11, 10625);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    			append_dev(option, t3);
    			append_dev(option, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*componentsData*/ 2 && t0_value !== (t0_value = /*compData*/ ctx[48][1] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*componentsData*/ 2 && t1_value !== (t1_value = (/*compData*/ ctx[48][2] == 0
    			? ``
    			: `, id: ${/*compData*/ ctx[48][2]}`) + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*componentsData*/ 2 && t3_value !== (t3_value = /*compData*/ ctx[48][3] + "")) set_data_dev(t3, t3_value);

    			if (dirty[0] & /*componentsData*/ 2 && option_value_value !== (option_value_value = /*compData*/ ctx[48][0])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$5.name,
    		type: "each",
    		source: "(351:10) {#each componentsData as compData}",
    		ctx
    	});

    	return block;
    }

    // (365:8) {:else}
    function create_else_block_2$1(ctx) {
    	let t_value = /*component*/ ctx[51][4] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*components*/ 2048 && t_value !== (t_value = /*component*/ ctx[51][4] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2$1.name,
    		type: "else",
    		source: "(365:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (363:8) {#if component[6] == currentlyEdited}
    function create_if_block_3$2(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "form-control form-control-sm");
    			add_location(input, file$6, 363, 9, 11029);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*editedComponentName*/ ctx[15]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[40]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*editedComponentName*/ 32768 && input.value !== /*editedComponentName*/ ctx[15]) {
    				set_input_value(input, /*editedComponentName*/ ctx[15]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(363:8) {#if component[6] == currentlyEdited}",
    		ctx
    	});

    	return block;
    }

    // (379:8) {:else}
    function create_else_block_1$4(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	function click_handler_5(...args) {
    		return /*click_handler_5*/ ctx[42](/*component*/ ctx[51], ...args);
    	}

    	function click_handler_6(...args) {
    		return /*click_handler_6*/ ctx[43](/*component*/ ctx[51], ...args);
    	}

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Edytuj";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Usuń";
    			attr_dev(button0, "class", "btn btn-sm btn-primary my-1");
    			add_location(button0, file$6, 379, 9, 11564);
    			attr_dev(button1, "class", "btn btn-sm btn-outline-danger ms-3 my-1");
    			add_location(button1, file$6, 387, 9, 11835);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler_5, false, false, false),
    					listen_dev(button1, "click", click_handler_6, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$4.name,
    		type: "else",
    		source: "(379:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (371:8) {#if component[6] == currentlyEdited}
    function create_if_block_2$3(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Zapisz";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Anuluj";
    			attr_dev(button0, "class", "btn btn-sm btn-outline-primary my-1");
    			add_location(button0, file$6, 371, 9, 11264);
    			attr_dev(button1, "class", "btn btn-sm btn-outline-danger ms-3 my-1");
    			add_location(button1, file$6, 372, 9, 11367);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*saveComponent*/ ctx[21], false, false, false),
    					listen_dev(button1, "click", /*click_handler_4*/ ctx[41], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(371:8) {#if component[6] == currentlyEdited}",
    		ctx
    	});

    	return block;
    }

    // (313:5) {#each components as component}
    function create_each_block_1$5(ctx) {
    	let tr;
    	let th;
    	let t0_value = /*component*/ ctx[51][3] + "";
    	let t0;
    	let t1;
    	let t2;
    	let td0;
    	let t3_value = /*component*/ ctx[51][6] + "";
    	let t3;
    	let t4;
    	let td1;
    	let t5;
    	let td2;
    	let t6;
    	let td3;

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[51][3] == 1) return create_if_block_5$1;
    		if (/*component*/ ctx[51][3] == /*components*/ ctx[11].length) return create_if_block_6$1;
    		return create_else_block_4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*component*/ ctx[51][6] == /*currentlyEdited*/ ctx[16]) return create_if_block_4$2;
    		return create_else_block_3$1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*component*/ ctx[51][6] == /*currentlyEdited*/ ctx[16]) return create_if_block_3$2;
    		return create_else_block_2$1;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_2(ctx);

    	function select_block_type_3(ctx, dirty) {
    		if (/*component*/ ctx[51][6] == /*currentlyEdited*/ ctx[16]) return create_if_block_2$3;
    		return create_else_block_1$4;
    	}

    	let current_block_type_3 = select_block_type_3(ctx);
    	let if_block3 = current_block_type_3(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block0.c();
    			t2 = space();
    			td0 = element("td");
    			t3 = text(t3_value);
    			t4 = space();
    			td1 = element("td");
    			if_block1.c();
    			t5 = space();
    			td2 = element("td");
    			if_block2.c();
    			t6 = space();
    			td3 = element("td");
    			if_block3.c();
    			attr_dev(th, "scope", "col");
    			attr_dev(th, "class", "pt-3");
    			add_location(th, file$6, 314, 7, 9451);
    			attr_dev(td0, "class", "pt-3");
    			add_location(td0, file$6, 343, 7, 10352);
    			attr_dev(td1, "class", "pt-3");
    			add_location(td1, file$6, 347, 7, 10418);
    			attr_dev(td2, "class", "pt-3");
    			add_location(td2, file$6, 361, 7, 10954);
    			add_location(td3, file$6, 369, 7, 11202);
    			add_location(tr, file$6, 313, 6, 9438);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, th);
    			append_dev(th, t0);
    			append_dev(th, t1);
    			if_block0.m(th, null);
    			append_dev(tr, t2);
    			append_dev(tr, td0);
    			append_dev(td0, t3);
    			append_dev(tr, t4);
    			append_dev(tr, td1);
    			if_block1.m(td1, null);
    			append_dev(tr, t5);
    			append_dev(tr, td2);
    			if_block2.m(td2, null);
    			append_dev(tr, t6);
    			append_dev(tr, td3);
    			if_block3.m(td3, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*components*/ 2048 && t0_value !== (t0_value = /*component*/ ctx[51][3] + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(th, null);
    				}
    			}

    			if (dirty[0] & /*components*/ 2048 && t3_value !== (t3_value = /*component*/ ctx[51][6] + "")) set_data_dev(t3, t3_value);

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(td1, null);
    				}
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_2(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(td2, null);
    				}
    			}

    			if (current_block_type_3 === (current_block_type_3 = select_block_type_3(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if_block3.d(1);
    				if_block3 = current_block_type_3(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(td3, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_block0.d();
    			if_block1.d();
    			if_block2.d();
    			if_block3.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$5.name,
    		type: "each",
    		source: "(313:5) {#each components as component}",
    		ctx
    	});

    	return block;
    }

    // (401:7) {:else}
    function create_else_block$4(ctx) {
    	let t_value = /*components*/ ctx[11][/*components*/ ctx[11].length - 1][3] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*components*/ 2048 && t_value !== (t_value = /*components*/ ctx[11][/*components*/ ctx[11].length - 1][3] + 1 + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(401:7) {:else}",
    		ctx
    	});

    	return block;
    }

    // (399:7) {#if components.length == 0}
    function create_if_block_1$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("1");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(399:7) {#if components.length == 0}",
    		ctx
    	});

    	return block;
    }

    // (410:8) {#each componentsData as compData}
    function create_each_block$6(ctx) {
    	let option;
    	let t0_value = /*compData*/ ctx[48][1] + "";
    	let t0;

    	let t1_value = (/*compData*/ ctx[48][2] == 0
    	? ``
    	: `, id: ${/*compData*/ ctx[48][2]}`) + "";

    	let t1;
    	let t2;
    	let t3_value = /*compData*/ ctx[48][3] + "";
    	let t3;
    	let t4;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text(t1_value);
    			t2 = text(" (");
    			t3 = text(t3_value);
    			t4 = text(")\r\n\t\t\t\t\t\t\t\t\t");
    			option.__value = option_value_value = /*compData*/ ctx[48][0];
    			option.value = option.__value;
    			add_location(option, file$6, 410, 9, 12446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    			append_dev(option, t2);
    			append_dev(option, t3);
    			append_dev(option, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*componentsData*/ 2 && t0_value !== (t0_value = /*compData*/ ctx[48][1] + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*componentsData*/ 2 && t1_value !== (t1_value = (/*compData*/ ctx[48][2] == 0
    			? ``
    			: `, id: ${/*compData*/ ctx[48][2]}`) + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*componentsData*/ 2 && t3_value !== (t3_value = /*compData*/ ctx[48][3] + "")) set_data_dev(t3, t3_value);

    			if (dirty[0] & /*componentsData*/ 2 && option_value_value !== (option_value_value = /*compData*/ ctx[48][0])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(410:8) {#each componentsData as compData}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div2;
    	let p;
    	let t1;
    	let div0;
    	let select0;
    	let t2;
    	let button0;
    	let span0;
    	let t4;
    	let button1;
    	let span1;
    	let t6;
    	let div1;
    	let label0;
    	let t8;
    	let input0;
    	let t9;
    	let label1;
    	let t11;
    	let input1;
    	let t12;
    	let label2;
    	let t14;
    	let input2;
    	let t15;
    	let label3;
    	let t17;
    	let input3;
    	let t18;
    	let label4;
    	let t20;
    	let input4;
    	let t21;
    	let label5;
    	let t23;
    	let select1;
    	let option0;
    	let option1;
    	let t26;
    	let label6;
    	let t28;
    	let select2;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let option6;
    	let t34;
    	let button2;
    	let t36;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*templatesData*/ ctx[0];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3$3(get_each_context_3$3(ctx, each_value_3, i));
    	}

    	let if_block = /*id*/ ctx[3] != 0 && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			p = element("p");
    			p.textContent = "Templates";
    			t1 = space();
    			div0 = element("div");
    			select0 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			button0 = element("button");
    			span0 = element("span");
    			span0.textContent = "+";
    			t4 = space();
    			button1 = element("button");
    			span1 = element("span");
    			span1.textContent = "×";
    			t6 = space();
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Nazwa";
    			t8 = space();
    			input0 = element("input");
    			t9 = space();
    			label1 = element("label");
    			label1.textContent = "Kolor tła";
    			t11 = space();
    			input1 = element("input");
    			t12 = space();
    			label2 = element("label");
    			label2.textContent = "Kolor tekstu";
    			t14 = space();
    			input2 = element("input");
    			t15 = space();
    			label3 = element("label");
    			label3.textContent = "Kolor przycisku";
    			t17 = space();
    			input3 = element("input");
    			t18 = space();
    			label4 = element("label");
    			label4.textContent = "Tekst w stopce";
    			t20 = space();
    			input4 = element("input");
    			t21 = space();
    			label5 = element("label");
    			label5.textContent = "Nawigacja";
    			t23 = space();
    			select1 = element("select");
    			option0 = element("option");
    			option0.textContent = "Klasyczna ";
    			option1 = element("option");
    			option1.textContent = "Alternatywna";
    			t26 = space();
    			label6 = element("label");
    			label6.textContent = "Czcionka strony";
    			t28 = space();
    			select2 = element("select");
    			option2 = element("option");
    			option2.textContent = "Segoe UI ";
    			option3 = element("option");
    			option3.textContent = "Tahoma ";
    			option4 = element("option");
    			option4.textContent = "Arial ";
    			option5 = element("option");
    			option5.textContent = "Trebuchet MS ";
    			option6 = element("option");
    			option6.textContent = "Lucida Grande";
    			t34 = space();
    			button2 = element("button");
    			button2.textContent = "Zapisz";
    			t36 = space();
    			if (if_block) if_block.c();
    			attr_dev(p, "class", "h1 mb-3");
    			add_location(p, file$6, 251, 1, 6629);
    			attr_dev(select0, "class", "form-select-sm col-4");
    			if (/*currentID*/ ctx[2] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[27].call(select0));
    			add_location(select0, file$6, 254, 2, 6818);
    			attr_dev(span0, "class", "fw-bold");
    			add_location(span0, file$6, 261, 70, 7154);
    			attr_dev(button0, "class", "btn btn-sm btn-primary px-3");
    			add_location(button0, file$6, 261, 2, 7086);
    			attr_dev(span1, "class", "fw-bold");
    			add_location(span1, file$6, 262, 80, 7276);
    			attr_dev(button1, "class", "btn btn-sm btn-outline-danger px-3");
    			add_location(button1, file$6, 262, 2, 7198);
    			attr_dev(div0, "class", "container d-flex justify-content-start gap-2 align-items-center mb-3 col-sm-10 col-md-8 mx-auto");
    			add_location(div0, file$6, 252, 1, 6664);
    			attr_dev(label0, "for", "templateName");
    			attr_dev(label0, "class", "form-label");
    			add_location(label0, file$6, 265, 2, 7382);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "templateName");
    			add_location(input0, file$6, 266, 2, 7444);
    			attr_dev(label1, "for", "templatebgColor");
    			attr_dev(label1, "class", "form-label mt-3");
    			add_location(label1, file$6, 268, 2, 7528);
    			attr_dev(input1, "type", "color");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "templatebgColor");
    			add_location(input1, file$6, 269, 2, 7602);
    			attr_dev(label2, "for", "templateFontColor");
    			attr_dev(label2, "class", "form-label mt-3");
    			add_location(label2, file$6, 271, 2, 7693);
    			attr_dev(input2, "type", "color");
    			attr_dev(input2, "class", "form-control");
    			attr_dev(input2, "id", "templateFontColor");
    			add_location(input2, file$6, 272, 2, 7772);
    			attr_dev(label3, "for", "templateButtonColor");
    			attr_dev(label3, "class", "form-label mt-3");
    			add_location(label3, file$6, 274, 2, 7867);
    			attr_dev(input3, "type", "color");
    			attr_dev(input3, "class", "form-control");
    			attr_dev(input3, "id", "templateButtonColor");
    			add_location(input3, file$6, 275, 2, 7951);
    			attr_dev(label4, "for", "templateFooterText");
    			attr_dev(label4, "class", "form-label mt-3");
    			add_location(label4, file$6, 277, 2, 8050);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", "form-control");
    			attr_dev(input4, "id", "templateFooterText");
    			add_location(input4, file$6, 278, 2, 8132);
    			attr_dev(label5, "for", "templateFooterText");
    			attr_dev(label5, "class", "form-label mt-3");
    			add_location(label5, file$6, 280, 2, 8228);
    			option0.__value = "classic";
    			option0.value = option0.__value;
    			add_location(option0, file$6, 282, 3, 8373);
    			option1.__value = "alternative";
    			option1.value = option1.__value;
    			add_location(option1, file$6, 283, 3, 8422);
    			attr_dev(select1, "class", "form-control form-select");
    			if (/*navStyle*/ ctx[9] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[33].call(select1));
    			add_location(select1, file$6, 281, 2, 8305);
    			attr_dev(label6, "for", "templateFooterText");
    			attr_dev(label6, "class", "form-label mt-3");
    			add_location(label6, file$6, 286, 2, 8492);
    			option2.__value = "Segoe UI";
    			option2.value = option2.__value;
    			add_location(option2, file$6, 288, 3, 8645);
    			option3.__value = "Tahoma";
    			option3.value = option3.__value;
    			add_location(option3, file$6, 289, 3, 8694);
    			option4.__value = "Arial";
    			option4.value = option4.__value;
    			add_location(option4, file$6, 290, 3, 8739);
    			option5.__value = "Trebuchet MS";
    			option5.value = option5.__value;
    			add_location(option5, file$6, 291, 3, 8782);
    			option6.__value = "Lucida Grande";
    			option6.value = option6.__value;
    			add_location(option6, file$6, 292, 3, 8839);
    			attr_dev(select2, "class", "form-control form-select");
    			if (/*fontFamily*/ ctx[10] === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[34].call(select2));
    			add_location(select2, file$6, 287, 2, 8575);
    			attr_dev(button2, "class", "btn btn-primary mt-4");
    			add_location(button2, file$6, 295, 2, 8912);
    			attr_dev(div1, "class", "container col-sm-10 col-md-8 mx-auto");
    			add_location(div1, file$6, 264, 1, 7328);
    			attr_dev(div2, "class", "tab-pane container active");
    			attr_dev(div2, "id", "templates");
    			add_location(div2, file$6, 250, 0, 6572);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, p);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, select0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select0, null);
    			}

    			select_option(select0, /*currentID*/ ctx[2]);
    			append_dev(div0, t2);
    			append_dev(div0, button0);
    			append_dev(button0, span0);
    			append_dev(div0, t4);
    			append_dev(div0, button1);
    			append_dev(button1, span1);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t8);
    			append_dev(div1, input0);
    			set_input_value(input0, /*name*/ ctx[4]);
    			append_dev(div1, t9);
    			append_dev(div1, label1);
    			append_dev(div1, t11);
    			append_dev(div1, input1);
    			set_input_value(input1, /*bgColor*/ ctx[5]);
    			append_dev(div1, t12);
    			append_dev(div1, label2);
    			append_dev(div1, t14);
    			append_dev(div1, input2);
    			set_input_value(input2, /*fontColor*/ ctx[6]);
    			append_dev(div1, t15);
    			append_dev(div1, label3);
    			append_dev(div1, t17);
    			append_dev(div1, input3);
    			set_input_value(input3, /*buttonColor*/ ctx[7]);
    			append_dev(div1, t18);
    			append_dev(div1, label4);
    			append_dev(div1, t20);
    			append_dev(div1, input4);
    			set_input_value(input4, /*footerText*/ ctx[8]);
    			append_dev(div1, t21);
    			append_dev(div1, label5);
    			append_dev(div1, t23);
    			append_dev(div1, select1);
    			append_dev(select1, option0);
    			append_dev(select1, option1);
    			select_option(select1, /*navStyle*/ ctx[9]);
    			append_dev(div1, t26);
    			append_dev(div1, label6);
    			append_dev(div1, t28);
    			append_dev(div1, select2);
    			append_dev(select2, option2);
    			append_dev(select2, option3);
    			append_dev(select2, option4);
    			append_dev(select2, option5);
    			append_dev(select2, option6);
    			select_option(select2, /*fontFamily*/ ctx[10]);
    			append_dev(div1, t34);
    			append_dev(div1, button2);
    			append_dev(div2, t36);
    			if (if_block) if_block.m(div2, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[27]),
    					listen_dev(select0, "change", /*changeData*/ ctx[25], false, false, false),
    					listen_dev(button0, "click", /*addTemplate*/ ctx[17], false, false, false),
    					listen_dev(button1, "click", /*deleteTemplate*/ ctx[19], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[28]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[29]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[30]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[31]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[32]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[33]),
    					listen_dev(select2, "change", /*select2_change_handler*/ ctx[34]),
    					listen_dev(button2, "click", /*saveTemplate*/ ctx[18], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*templatesData*/ 1) {
    				each_value_3 = /*templatesData*/ ctx[0];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}

    			if (dirty[0] & /*currentID*/ 4) {
    				select_option(select0, /*currentID*/ ctx[2]);
    			}

    			if (dirty[0] & /*name*/ 16 && input0.value !== /*name*/ ctx[4]) {
    				set_input_value(input0, /*name*/ ctx[4]);
    			}

    			if (dirty[0] & /*bgColor*/ 32) {
    				set_input_value(input1, /*bgColor*/ ctx[5]);
    			}

    			if (dirty[0] & /*fontColor*/ 64) {
    				set_input_value(input2, /*fontColor*/ ctx[6]);
    			}

    			if (dirty[0] & /*buttonColor*/ 128) {
    				set_input_value(input3, /*buttonColor*/ ctx[7]);
    			}

    			if (dirty[0] & /*footerText*/ 256 && input4.value !== /*footerText*/ ctx[8]) {
    				set_input_value(input4, /*footerText*/ ctx[8]);
    			}

    			if (dirty[0] & /*navStyle*/ 512) {
    				select_option(select1, /*navStyle*/ ctx[9]);
    			}

    			if (dirty[0] & /*fontFamily*/ 1024) {
    				select_option(select2, /*fontFamily*/ ctx[10]);
    			}

    			if (/*id*/ ctx[3] != 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const hexToRGB = (hexString = "#000000") => {
    		let r = parseInt(hexString.substring(1, 3), 16);
    		let g = parseInt(hexString.substring(3, 5), 16);
    		let b = parseInt(hexString.substring(5, 7), 16);
    		return `rgb(${r}, ${g}, ${b})`;
    	};

    	const RGBtoHex = (rgbString = "rgb(11,255,92)") => {
    		rgbString = rgbString.replaceAll(" ", "");
    		let r = parseInt(rgbString.substring(rgbString.indexOf("(") + 1, rgbString.indexOf(",")));
    		let g = parseInt(rgbString.substring(rgbString.indexOf(",") + 1, rgbString.lastIndexOf(",")));
    		let b = parseInt(rgbString.substring(rgbString.lastIndexOf(",") + 1, rgbString.indexOf(")")));
    		let cStrings = [r.toString(16), g.toString(16), b.toString(16)];

    		let leadingZeros = cStrings.map(cString => {
    			let fString = cString.length == 1 ? "0" + cString : cString;
    			return fString;
    		});

    		return `#${leadingZeros[0]}${leadingZeros[1]}${leadingZeros[2]}`;
    	};

    	let templatesData = [];
    	let componentsData = [];
    	let currentID = 0;
    	let id = 0;
    	let name = "";
    	let bgColor = "#ffffff";
    	let fontColor = "#000000";
    	let buttonColor = "#777777";
    	let footerText = "";
    	let navStyle = "classic";
    	let fontFamily = "Segoe UI";
    	let components = [];
    	let newComponent = 1;
    	let newComponentName = "";
    	let editedComponent = 0;
    	let editedComponentName = "";
    	let currentlyEdited = 0;

    	const getData = () => {
    		fetch("http://localhost:5000/adminGetAllTemplates", { method: "POST" }).then(response => response.json()).then(data => {
    			$$invalidate(0, templatesData = data);
    			changeData();
    		});

    		fetch("http://localhost:5000/adminGetAllComponents", { method: "POST" }).then(response => response.json()).then(data => {
    			$$invalidate(1, componentsData = data);
    		});
    	};

    	const addTemplate = () => {
    		$$invalidate(0, templatesData = [
    			...templatesData,
    			[
    				0,
    				"",
    				"rgb(255,255,255)",
    				"rgb(0,0,0)",
    				"rgb(0,0,0)",
    				"rgb(119,119,119)",
    				"",
    				"classic",
    				"Segoe UI",
    				[]
    			]
    		]);

    		$$invalidate(2, currentID = templatesData.length - 1);
    		changeData();
    	};

    	const saveTemplate = () => {
    		if (templatesData.length == 0) return;

    		fetch("http://localhost:5000/adminSaveTemplate", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				id: templatesData[currentID][0],
    				name,
    				bgColor: hexToRGB(bgColor),
    				fontColor: hexToRGB(fontColor),
    				buttonColor: hexToRGB(buttonColor),
    				footerText,
    				navStyle,
    				fontFamily
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    			}
    		});
    	};

    	const deleteTemplate = () => {
    		if (templatesData.length == 0) return;

    		if (templatesData[currentID][0] == 1) {
    			alert("Nie można usunąć domyślnego układu!");
    			return;
    		}

    		if (!confirm("Czy na pewno usunąć układ?")) return;

    		if (templatesData[currentID][0] == 0) {
    			$$invalidate(0, templatesData = templatesData.filter((elem, idx) => {
    				return idx != currentID;
    			}));

    			$$invalidate(2, currentID = templatesData.length - 1);
    			changeData();
    		} else {
    			fetch("http://localhost:5000/adminDeleteTemplate", {
    				method: "POST",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify({ id: templatesData[currentID][0] })
    			}).then(response => response.json()).then(data => {
    				if (data.state == "valid") {
    					$$invalidate(2, currentID = templatesData.length - 2);
    					getData();
    				}
    			});
    		}
    	};

    	const addComponent = () => {
    		fetch("http://localhost:5000/adminAddComponent", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				templateID: templatesData[currentID][0],
    				componentID: newComponent,
    				name: newComponentName
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    				$$invalidate(12, newComponent = 1);
    				$$invalidate(13, newComponentName = "");
    			}
    		});
    	};

    	const saveComponent = () => {
    		fetch("http://localhost:5000/adminSaveComponent", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				id: currentlyEdited,
    				templateID: templatesData[currentID][0],
    				componentID: editedComponent,
    				name: editedComponentName
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    				$$invalidate(16, currentlyEdited = 0);
    				$$invalidate(14, editedComponent = 1);
    				$$invalidate(15, editedComponentName = "");
    			}
    		});
    	};

    	const deleteComponent = (id, order) => {
    		fetch("http://localhost:5000/adminDeleteComponent", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				id,
    				order,
    				templateID: templatesData[currentID][0]
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    			}
    		});
    	};

    	const orderUp = (id, order) => {
    		fetch("http://localhost:5000/adminComponentOrderUp", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				id,
    				order,
    				templateID: templatesData[currentID][0]
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    			}
    		});
    	};

    	const orderDown = (id, order) => {
    		fetch("http://localhost:5000/adminComponentOrderDown", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				id,
    				order,
    				templateID: templatesData[currentID][0]
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.state == "valid") {
    				getData();
    			}
    		});
    	};

    	const changeData = () => {
    		if (templatesData.length > 0) {
    			$$invalidate(3, id = templatesData[currentID][0]);
    			$$invalidate(4, name = templatesData[currentID][1]);
    			$$invalidate(5, bgColor = RGBtoHex(templatesData[currentID][2]));
    			$$invalidate(6, fontColor = RGBtoHex(templatesData[currentID][3]));
    			$$invalidate(7, buttonColor = RGBtoHex(templatesData[currentID][5]));
    			$$invalidate(8, footerText = templatesData[currentID][6]);
    			$$invalidate(9, navStyle = templatesData[currentID][7]);
    			$$invalidate(10, fontFamily = templatesData[currentID][8]);
    			$$invalidate(11, components = templatesData[currentID][9]);
    		} else {
    			$$invalidate(
    				3,
    				[
    					id,
    					name,
    					bgColor,
    					fontColor,
    					buttonColor,
    					footerText,
    					navStyle,
    					fontFamily,
    					components
    				] = ["", "", "#ffffff", "#000000", "#777777", "", "classic", "Segoe UI", []],
    				id,
    				$$invalidate(4, name),
    				$$invalidate(5, bgColor),
    				$$invalidate(6, fontColor),
    				$$invalidate(7, buttonColor),
    				$$invalidate(8, footerText),
    				$$invalidate(9, navStyle),
    				$$invalidate(10, fontFamily),
    				$$invalidate(11, components)
    			);
    		}
    	};

    	getData();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AdminTemplates> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AdminTemplates", $$slots, []);

    	function select0_change_handler() {
    		currentID = select_value(this);
    		$$invalidate(2, currentID);
    	}

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(4, name);
    	}

    	function input1_input_handler() {
    		bgColor = this.value;
    		$$invalidate(5, bgColor);
    	}

    	function input2_input_handler() {
    		fontColor = this.value;
    		$$invalidate(6, fontColor);
    	}

    	function input3_input_handler() {
    		buttonColor = this.value;
    		$$invalidate(7, buttonColor);
    	}

    	function input4_input_handler() {
    		footerText = this.value;
    		$$invalidate(8, footerText);
    	}

    	function select1_change_handler() {
    		navStyle = select_value(this);
    		$$invalidate(9, navStyle);
    	}

    	function select2_change_handler() {
    		fontFamily = select_value(this);
    		$$invalidate(10, fontFamily);
    	}

    	const click_handler = component => orderDown(component[6], component[3]);
    	const click_handler_1 = component => orderUp(component[6], component[3]);
    	const click_handler_2 = component => orderUp(component[6], component[3]);
    	const click_handler_3 = component => orderDown(component[6], component[3]);

    	function select_change_handler() {
    		editedComponent = select_value(this);
    		$$invalidate(14, editedComponent);
    		$$invalidate(1, componentsData);
    	}

    	function input_input_handler() {
    		editedComponentName = this.value;
    		$$invalidate(15, editedComponentName);
    	}

    	const click_handler_4 = () => {
    		$$invalidate(16, currentlyEdited = 0);
    	};

    	const click_handler_5 = component => {
    		$$invalidate(16, currentlyEdited = component[6]);
    		$$invalidate(14, editedComponent = component[0]);
    		$$invalidate(15, editedComponentName = component[4]);
    	};

    	const click_handler_6 = component => deleteComponent(component[6], component[3]);

    	function select_change_handler_1() {
    		newComponent = select_value(this);
    		$$invalidate(12, newComponent);
    		$$invalidate(1, componentsData);
    	}

    	function input_input_handler_1() {
    		newComponentName = this.value;
    		$$invalidate(13, newComponentName);
    	}

    	$$self.$capture_state = () => ({
    		hexToRGB,
    		RGBtoHex,
    		templatesData,
    		componentsData,
    		currentID,
    		id,
    		name,
    		bgColor,
    		fontColor,
    		buttonColor,
    		footerText,
    		navStyle,
    		fontFamily,
    		components,
    		newComponent,
    		newComponentName,
    		editedComponent,
    		editedComponentName,
    		currentlyEdited,
    		getData,
    		addTemplate,
    		saveTemplate,
    		deleteTemplate,
    		addComponent,
    		saveComponent,
    		deleteComponent,
    		orderUp,
    		orderDown,
    		changeData
    	});

    	$$self.$inject_state = $$props => {
    		if ("templatesData" in $$props) $$invalidate(0, templatesData = $$props.templatesData);
    		if ("componentsData" in $$props) $$invalidate(1, componentsData = $$props.componentsData);
    		if ("currentID" in $$props) $$invalidate(2, currentID = $$props.currentID);
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    		if ("bgColor" in $$props) $$invalidate(5, bgColor = $$props.bgColor);
    		if ("fontColor" in $$props) $$invalidate(6, fontColor = $$props.fontColor);
    		if ("buttonColor" in $$props) $$invalidate(7, buttonColor = $$props.buttonColor);
    		if ("footerText" in $$props) $$invalidate(8, footerText = $$props.footerText);
    		if ("navStyle" in $$props) $$invalidate(9, navStyle = $$props.navStyle);
    		if ("fontFamily" in $$props) $$invalidate(10, fontFamily = $$props.fontFamily);
    		if ("components" in $$props) $$invalidate(11, components = $$props.components);
    		if ("newComponent" in $$props) $$invalidate(12, newComponent = $$props.newComponent);
    		if ("newComponentName" in $$props) $$invalidate(13, newComponentName = $$props.newComponentName);
    		if ("editedComponent" in $$props) $$invalidate(14, editedComponent = $$props.editedComponent);
    		if ("editedComponentName" in $$props) $$invalidate(15, editedComponentName = $$props.editedComponentName);
    		if ("currentlyEdited" in $$props) $$invalidate(16, currentlyEdited = $$props.currentlyEdited);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		templatesData,
    		componentsData,
    		currentID,
    		id,
    		name,
    		bgColor,
    		fontColor,
    		buttonColor,
    		footerText,
    		navStyle,
    		fontFamily,
    		components,
    		newComponent,
    		newComponentName,
    		editedComponent,
    		editedComponentName,
    		currentlyEdited,
    		addTemplate,
    		saveTemplate,
    		deleteTemplate,
    		addComponent,
    		saveComponent,
    		deleteComponent,
    		orderUp,
    		orderDown,
    		changeData,
    		getData,
    		select0_change_handler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		select1_change_handler,
    		select2_change_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		select_change_handler,
    		input_input_handler,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		select_change_handler_1,
    		input_input_handler_1
    	];
    }

    class AdminTemplates extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { getData: 26 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AdminTemplates",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get getData() {
    		return this.$$.ctx[26];
    	}

    	set getData(value) {
    		throw new Error("<AdminTemplates>: Cannot set read-only property 'getData'");
    	}
    }

    /* src\Admin.svelte generated by Svelte v3.24.1 */
    const file$7 = "src\\Admin.svelte";

    function create_fragment$7(ctx) {
    	let div3;
    	let div0;
    	let nav;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let a2;
    	let t5;
    	let a3;
    	let t7;
    	let a4;
    	let t9;
    	let a5;
    	let t11;
    	let a6;
    	let t13;
    	let div2;
    	let div1;
    	let adminfeaturettes;
    	let t14;
    	let adminsliders;
    	let t15;
    	let admingalleries;
    	let t16;
    	let adminarticles;
    	let t17;
    	let admincategories;
    	let t18;
    	let adminlinks;
    	let t19;
    	let admintemplates;
    	let current;

    	adminfeaturettes = new AdminFeaturettes({
    			props: { admTemplates: /*admTemplates*/ ctx[2] },
    			$$inline: true
    		});

    	adminsliders = new AdminSliders({
    			props: { admTemplates: /*admTemplates*/ ctx[2] },
    			$$inline: true
    		});

    	admingalleries = new AdminGalleries({
    			props: { admArticles: /*admArticles*/ ctx[0] },
    			$$inline: true
    		});

    	let adminarticles_props = { admLinks: /*admLinks*/ ctx[1] };

    	adminarticles = new AdminArticles({
    			props: adminarticles_props,
    			$$inline: true
    		});

    	/*adminarticles_binding*/ ctx[3](adminarticles);

    	admincategories = new AdminCategories({
    			props: {
    				admArticles: /*admArticles*/ ctx[0],
    				admLinks: /*admLinks*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let adminlinks_props = {};
    	adminlinks = new AdminLinks({ props: adminlinks_props, $$inline: true });
    	/*adminlinks_binding*/ ctx[4](adminlinks);
    	let admintemplates_props = {};

    	admintemplates = new AdminTemplates({
    			props: admintemplates_props,
    			$$inline: true
    		});

    	/*admintemplates_binding*/ ctx[5](admintemplates);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "Featurettes";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Sliders";
    			t3 = space();
    			a2 = element("a");
    			a2.textContent = "Galleries";
    			t5 = space();
    			a3 = element("a");
    			a3.textContent = "Articles";
    			t7 = space();
    			a4 = element("a");
    			a4.textContent = "Categories";
    			t9 = space();
    			a5 = element("a");
    			a5.textContent = "Links";
    			t11 = space();
    			a6 = element("a");
    			a6.textContent = "Templates";
    			t13 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(adminfeaturettes.$$.fragment);
    			t14 = space();
    			create_component(adminsliders.$$.fragment);
    			t15 = space();
    			create_component(admingalleries.$$.fragment);
    			t16 = space();
    			create_component(adminarticles.$$.fragment);
    			t17 = space();
    			create_component(admincategories.$$.fragment);
    			t18 = space();
    			create_component(adminlinks.$$.fragment);
    			t19 = space();
    			create_component(admintemplates.$$.fragment);
    			attr_dev(a0, "href", "#featurettes");
    			attr_dev(a0, "class", "nav-link");
    			attr_dev(a0, "data-bs-toggle", "tab");
    			add_location(a0, file$7, 17, 3, 602);
    			attr_dev(a1, "href", "#sliders");
    			attr_dev(a1, "class", "nav-link");
    			attr_dev(a1, "data-bs-toggle", "tab");
    			add_location(a1, file$7, 18, 3, 683);
    			attr_dev(a2, "href", "#galleries");
    			attr_dev(a2, "class", "nav-link");
    			attr_dev(a2, "data-bs-toggle", "tab");
    			add_location(a2, file$7, 19, 3, 756);
    			attr_dev(a3, "href", "#articles");
    			attr_dev(a3, "class", "nav-link");
    			attr_dev(a3, "data-bs-toggle", "tab");
    			add_location(a3, file$7, 20, 3, 833);
    			attr_dev(a4, "href", "#categories");
    			attr_dev(a4, "class", "nav-link");
    			attr_dev(a4, "data-bs-toggle", "tab");
    			add_location(a4, file$7, 21, 3, 908);
    			attr_dev(a5, "href", "#links");
    			attr_dev(a5, "class", "nav-link");
    			attr_dev(a5, "data-bs-toggle", "tab");
    			add_location(a5, file$7, 22, 3, 987);
    			attr_dev(a6, "href", "#templates");
    			attr_dev(a6, "class", "nav-link active");
    			attr_dev(a6, "data-bs-toggle", "tab");
    			add_location(a6, file$7, 23, 3, 1056);
    			attr_dev(nav, "class", "nav nav-pills justify-content-start flex-column flex-md-row mb-3");
    			add_location(nav, file$7, 16, 2, 519);
    			attr_dev(div0, "class", "col-12");
    			add_location(div0, file$7, 15, 1, 495);
    			attr_dev(div1, "class", "tab-content");
    			add_location(div1, file$7, 27, 2, 1181);
    			attr_dev(div2, "class", "col-12");
    			add_location(div2, file$7, 26, 1, 1157);
    			attr_dev(div3, "class", "container mt-2");
    			add_location(div3, file$7, 14, 0, 464);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, nav);
    			append_dev(nav, a0);
    			append_dev(nav, t1);
    			append_dev(nav, a1);
    			append_dev(nav, t3);
    			append_dev(nav, a2);
    			append_dev(nav, t5);
    			append_dev(nav, a3);
    			append_dev(nav, t7);
    			append_dev(nav, a4);
    			append_dev(nav, t9);
    			append_dev(nav, a5);
    			append_dev(nav, t11);
    			append_dev(nav, a6);
    			append_dev(div3, t13);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			mount_component(adminfeaturettes, div1, null);
    			append_dev(div1, t14);
    			mount_component(adminsliders, div1, null);
    			append_dev(div1, t15);
    			mount_component(admingalleries, div1, null);
    			append_dev(div1, t16);
    			mount_component(adminarticles, div1, null);
    			append_dev(div1, t17);
    			mount_component(admincategories, div1, null);
    			append_dev(div1, t18);
    			mount_component(adminlinks, div1, null);
    			append_dev(div1, t19);
    			mount_component(admintemplates, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const adminfeaturettes_changes = {};
    			if (dirty & /*admTemplates*/ 4) adminfeaturettes_changes.admTemplates = /*admTemplates*/ ctx[2];
    			adminfeaturettes.$set(adminfeaturettes_changes);
    			const adminsliders_changes = {};
    			if (dirty & /*admTemplates*/ 4) adminsliders_changes.admTemplates = /*admTemplates*/ ctx[2];
    			adminsliders.$set(adminsliders_changes);
    			const admingalleries_changes = {};
    			if (dirty & /*admArticles*/ 1) admingalleries_changes.admArticles = /*admArticles*/ ctx[0];
    			admingalleries.$set(admingalleries_changes);
    			const adminarticles_changes = {};
    			if (dirty & /*admLinks*/ 2) adminarticles_changes.admLinks = /*admLinks*/ ctx[1];
    			adminarticles.$set(adminarticles_changes);
    			const admincategories_changes = {};
    			if (dirty & /*admArticles*/ 1) admincategories_changes.admArticles = /*admArticles*/ ctx[0];
    			if (dirty & /*admLinks*/ 2) admincategories_changes.admLinks = /*admLinks*/ ctx[1];
    			admincategories.$set(admincategories_changes);
    			const adminlinks_changes = {};
    			adminlinks.$set(adminlinks_changes);
    			const admintemplates_changes = {};
    			admintemplates.$set(admintemplates_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(adminfeaturettes.$$.fragment, local);
    			transition_in(adminsliders.$$.fragment, local);
    			transition_in(admingalleries.$$.fragment, local);
    			transition_in(adminarticles.$$.fragment, local);
    			transition_in(admincategories.$$.fragment, local);
    			transition_in(adminlinks.$$.fragment, local);
    			transition_in(admintemplates.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(adminfeaturettes.$$.fragment, local);
    			transition_out(adminsliders.$$.fragment, local);
    			transition_out(admingalleries.$$.fragment, local);
    			transition_out(adminarticles.$$.fragment, local);
    			transition_out(admincategories.$$.fragment, local);
    			transition_out(adminlinks.$$.fragment, local);
    			transition_out(admintemplates.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(adminfeaturettes);
    			destroy_component(adminsliders);
    			destroy_component(admingalleries);
    			/*adminarticles_binding*/ ctx[3](null);
    			destroy_component(adminarticles);
    			destroy_component(admincategories);
    			/*adminlinks_binding*/ ctx[4](null);
    			destroy_component(adminlinks);
    			/*admintemplates_binding*/ ctx[5](null);
    			destroy_component(admintemplates);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let admArticles;
    	let admLinks;
    	let admTemplates;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Admin> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Admin", $$slots, []);

    	function adminarticles_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			admArticles = $$value;
    			$$invalidate(0, admArticles);
    		});
    	}

    	function adminlinks_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			admLinks = $$value;
    			$$invalidate(1, admLinks);
    		});
    	}

    	function admintemplates_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			admTemplates = $$value;
    			$$invalidate(2, admTemplates);
    		});
    	}

    	$$self.$capture_state = () => ({
    		AdminFeaturettes,
    		AdminArticles,
    		AdminCategories,
    		AdminGalleries,
    		AdminLinks,
    		AdminSliders,
    		AdminTemplates,
    		admArticles,
    		admLinks,
    		admTemplates
    	});

    	$$self.$inject_state = $$props => {
    		if ("admArticles" in $$props) $$invalidate(0, admArticles = $$props.admArticles);
    		if ("admLinks" in $$props) $$invalidate(1, admLinks = $$props.admLinks);
    		if ("admTemplates" in $$props) $$invalidate(2, admTemplates = $$props.admTemplates);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		admArticles,
    		admLinks,
    		admTemplates,
    		adminarticles_binding,
    		adminlinks_binding,
    		admintemplates_binding
    	];
    }

    class Admin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Admin",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const app = new Admin({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
