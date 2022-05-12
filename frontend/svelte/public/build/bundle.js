
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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

    /* \ad514i\Homes$\pboron\CMSProject\frontend\svelte\src\Search.svelte generated by Svelte v3.24.1 */

    const file = "\\ad514i\\Homes$\\pboron\\CMSProject\\frontend\\svelte\\src\\Search.svelte";

    function create_fragment(ctx) {
    	let form;
    	let input;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "OK";
    			attr_dev(input, "class", "form-control me-2");
    			attr_dev(input, "type", "search");
    			attr_dev(input, "placeholder", "Search");
    			attr_dev(input, "aria-label", "Search");
    			attr_dev(input, "name", "text");
    			add_location(input, file, 9, 4, 193);
    			attr_dev(button, "class", "btn btn-outline-success");
    			attr_dev(button, "type", "submit");
    			add_location(button, file, 17, 4, 378);
    			attr_dev(form, "class", "d-flex");
    			add_location(form, file, 8, 0, 132);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, input);
    			set_input_value(input, /*text*/ ctx[0]);
    			append_dev(form, t0);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(form, "submit", prevent_default(/*search*/ ctx[1]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) {
    				set_input_value(input, /*text*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
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
    	let text = "";

    	function search() {
    		window.location.href = `/search?text=${text}`;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Search> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Search", $$slots, []);

    	function input_input_handler() {
    		text = this.value;
    		$$invalidate(0, text);
    	}

    	$$self.$capture_state = () => ({ text, search });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, search, input_input_handler];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* \ad514i\Homes$\pboron\CMSProject\frontend\svelte\src\Switch.svelte generated by Svelte v3.24.1 */

    const file$1 = "\\ad514i\\Homes$\\pboron\\CMSProject\\frontend\\svelte\\src\\Switch.svelte";

    // (1:0) <script>   const setRootStyle = (key, val) => {    document.documentElement.style.setProperty(key, val);   }
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>   const setRootStyle = (key, val) => {    document.documentElement.style.setProperty(key, val);   }",
    		ctx
    	});

    	return block;
    }

    // (56:41)    <div class="form-check form-switch">    <input     class="form-check-input"     type="checkbox"     role="switch"     id="flexSwitchCheckDefault"     on:change={switchDarkMode}
    function create_then_block(ctx) {
    	let div;
    	let input;
    	let t0;
    	let label;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			label.textContent = "Dark";
    			attr_dev(input, "class", "form-check-input");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "role", "switch");
    			attr_dev(input, "id", "flexSwitchCheckDefault");
    			add_location(input, file$1, 57, 2, 1594);
    			attr_dev(label, "class", "form-check-label darkmode-text");
    			attr_dev(label, "for", "flexSwitchCheckDefault");
    			add_location(label, file$1, 65, 2, 1768);
    			attr_dev(div, "class", "form-check form-switch");
    			add_location(div, file$1, 56, 1, 1554);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			input.checked = /*darkMode*/ ctx[0];
    			append_dev(div, t0);
    			append_dev(div, label);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*switchDarkMode*/ ctx[1], false, false, false),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[3])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*darkMode*/ 1) {
    				input.checked = /*darkMode*/ ctx[0];
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(56:41)    <div class=\\\"form-check form-switch\\\">    <input     class=\\\"form-check-input\\\"     type=\\\"checkbox\\\"     role=\\\"switch\\\"     id=\\\"flexSwitchCheckDefault\\\"     on:change={switchDarkMode}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   const setRootStyle = (key, val) => {    document.documentElement.style.setProperty(key, val);   }
    function create_pending_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script>   const setRootStyle = (key, val) => {    document.documentElement.style.setProperty(key, val);   }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 2
    	};

    	handle_promise(promise = /*darkModeFetch*/ ctx[2], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[2] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
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
    	const setRootStyle = (key, val) => {
    		document.documentElement.style.setProperty(key, val);
    	};

    	const setColors = darkMode => {
    		if (darkMode) {
    			setRootStyle("--bg-color", "black");
    			setRootStyle("--card-color", "rgb(48, 48, 48)");
    			setRootStyle("--font-color", "white");
    			setRootStyle("--icon-color", "white");
    			setRootStyle("--button-color", "rgb(90, 90, 90)");
    		} else {
    			setRootStyle("--bg-color", colors.bg_color);
    			setRootStyle("--card-color", colors.bg_color);
    			setRootStyle("--font-color", colors.font_color);
    			setRootStyle("--icon-color", colors.icon_color);
    			setRootStyle("--button-color", colors.button_color);
    		}
    	};

    	const getDarkModeSettings = async callback => {
    		let response = await fetch("/getDarkMode", { method: "POST" });
    		let responseJSON = await response.json();
    		let darkModeResp = responseJSON.darkMode;
    		$$invalidate(0, darkMode = darkModeResp);
    		callback();
    		return darkModeResp;
    	};

    	const switchDarkMode = () => {
    		fetch("/switchDarkMode", { method: "POST" }).then(resp => {
    			getDarkModeSettings(() => {
    				return;
    			});
    		});
    	};

    	const getTemplateColors = async () => {
    		let response = await fetch("/getTemplateColors");
    		let responseJSON = await response.json();
    		return responseJSON;
    	};

    	const init = async () => {
    		colors = await getTemplateColors();
    		setColors(darkMode);
    	};

    	let darkMode = false;
    	let darkModeFetch = getDarkModeSettings(() => init());
    	let colors = {};
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Switch", $$slots, []);

    	function input_change_handler() {
    		darkMode = this.checked;
    		$$invalidate(0, darkMode);
    	}

    	$$self.$capture_state = () => ({
    		setRootStyle,
    		setColors,
    		getDarkModeSettings,
    		switchDarkMode,
    		getTemplateColors,
    		init,
    		darkMode,
    		darkModeFetch,
    		colors
    	});

    	$$self.$inject_state = $$props => {
    		if ("darkMode" in $$props) $$invalidate(0, darkMode = $$props.darkMode);
    		if ("darkModeFetch" in $$props) $$invalidate(2, darkModeFetch = $$props.darkModeFetch);
    		if ("colors" in $$props) colors = $$props.colors;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [darkMode, switchDarkMode, darkModeFetch, input_change_handler];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* \ad514i\Homes$\pboron\CMSProject\frontend\svelte\src\Navigation.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;
    const file$2 = "\\ad514i\\Homes$\\pboron\\CMSProject\\frontend\\svelte\\src\\Navigation.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>   import Search from "./Search.svelte";   import Switch from "./Switch.svelte";   export let vertical;     async function getLinks() {    let response = await fetch(`/getLinks?component=header`, {     method: "post"    }
    function create_catch_block_2(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_2.name,
    		type: "catch",
    		source: "(1:0) <script>   import Search from \\\"./Search.svelte\\\";   import Switch from \\\"./Switch.svelte\\\";   export let vertical;     async function getLinks() {    let response = await fetch(`/getLinks?component=header`, {     method: \\\"post\\\"    }",
    		ctx
    	});

    	return block;
    }

    // (31:0) {:then navData}
    function create_then_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let switch_1;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*vertical*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	switch_1 = new Switch({ $$inline: true });

    	const block = {
    		c: function create() {
    			if_block.c();
    			t = space();
    			create_component(switch_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(switch_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(t.parentNode, t);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(switch_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(switch_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(switch_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(31:0) {:then navData}",
    		ctx
    	});

    	return block;
    }

    // (112:1) {:else}
    function create_else_block_1(ctx) {
    	let ul;
    	let t0;
    	let promise;
    	let t1;
    	let li;
    	let search;
    	let current;
    	let each_value_1 = /*navData*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block_2,
    		then: create_then_block_2,
    		catch: create_catch_block_1,
    		value: 1
    	};

    	handle_promise(promise = /*loggedUserData*/ ctx[1], info);
    	search = new Search({ $$inline: true });

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			info.block.c();
    			t1 = space();
    			li = element("li");
    			create_component(search.$$.fragment);
    			attr_dev(li, "class", "nav-item nav-link");
    			set_style(li, "width", "250px");
    			add_location(li, file$2, 161, 3, 4049);
    			attr_dev(ul, "class", "nav flex-column");
    			add_location(ul, file$2, 112, 2, 2847);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t0);
    			info.block.m(ul, info.anchor = null);
    			info.mount = () => ul;
    			info.anchor = t1;
    			append_dev(ul, t1);
    			append_dev(ul, li);
    			mount_component(search, li, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*navData*/ 4) {
    				each_value_1 = /*navData*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			info.ctx = ctx;

    			if (dirty & /*loggedUserData*/ 2 && promise !== (promise = /*loggedUserData*/ ctx[1]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[1] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(search.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(search.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			info.block.d();
    			info.token = null;
    			info = null;
    			destroy_component(search);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(112:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (32:1) {#if !vertical}
    function create_if_block(ctx) {
    	let nav;
    	let div1;
    	let button;
    	let span;
    	let t0;
    	let div0;
    	let ul;
    	let t1;
    	let promise;
    	let t2;
    	let search;
    	let current;
    	let each_value = /*navData*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block$1,
    		value: 1
    	};

    	handle_promise(promise = /*loggedUserData*/ ctx[1], info);
    	search = new Search({ $$inline: true });

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			button = element("button");
    			span = element("span");
    			t0 = space();
    			div0 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			info.block.c();
    			t2 = space();
    			create_component(search.$$.fragment);
    			attr_dev(span, "class", "navbar-toggler-icon");
    			add_location(span, file$2, 43, 5, 1172);
    			attr_dev(button, "class", "navbar-toggler");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-bs-toggle", "collapse");
    			attr_dev(button, "data-bs-target", "#navbarSupportedContent");
    			attr_dev(button, "aria-controls", "navbarSupportedContent");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file$2, 34, 4, 913);
    			attr_dev(ul, "class", "navbar-nav me-auto mb-2 mb-lg-0");
    			add_location(ul, file$2, 49, 5, 1320);
    			attr_dev(div0, "class", "collapse navbar-collapse");
    			attr_dev(div0, "id", "navbarSupportedContent");
    			add_location(div0, file$2, 45, 4, 1229);
    			attr_dev(div1, "class", "container-fluid");
    			add_location(div1, file$2, 33, 3, 878);
    			attr_dev(nav, "class", "navbar navbar-expand-lg");
    			add_location(nav, file$2, 32, 2, 836);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			append_dev(div1, button);
    			append_dev(button, span);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t1);
    			info.block.m(ul, info.anchor = null);
    			info.mount = () => ul;
    			info.anchor = null;
    			append_dev(div1, t2);
    			mount_component(search, div1, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*navData*/ 4) {
    				each_value = /*navData*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t1);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			info.ctx = ctx;

    			if (dirty & /*loggedUserData*/ 2 && promise !== (promise = /*loggedUserData*/ ctx[1]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[1] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(search.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(search.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			info.block.d();
    			info.token = null;
    			info = null;
    			destroy_component(search);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(32:1) {#if !vertical}",
    		ctx
    	});

    	return block;
    }

    // (114:3) {#each navData as item}
    function create_each_block_1(ctx) {
    	let li;
    	let a;
    	let t_value = /*item*/ ctx[3].text + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", "nav-link");
    			attr_dev(a, "href", a_href_value = /*item*/ ctx[3].url);
    			add_location(a, file$2, 115, 5, 2937);
    			attr_dev(li, "class", "nav-item");
    			add_location(li, file$2, 114, 4, 2909);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navData*/ 4 && t_value !== (t_value = /*item*/ ctx[3].text + "")) set_data_dev(t, t_value);

    			if (dirty & /*navData*/ 4 && a_href_value !== (a_href_value = /*item*/ ctx[3].url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(114:3) {#each navData as item}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   import Search from "./Search.svelte";   import Switch from "./Switch.svelte";   export let vertical;     async function getLinks() {    let response = await fetch(`/getLinks?component=header`, {     method: "post"    }
    function create_catch_block_1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1.name,
    		type: "catch",
    		source: "(1:0) <script>   import Search from \\\"./Search.svelte\\\";   import Switch from \\\"./Switch.svelte\\\";   export let vertical;     async function getLinks() {    let response = await fetch(`/getLinks?component=header`, {     method: \\\"post\\\"    }",
    		ctx
    	});

    	return block;
    }

    // (121:3) {:then loggedUserData}
    function create_then_block_2(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*loggedUserData*/ ctx[1].error_message) return create_if_block_3;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_2.name,
    		type: "then",
    		source: "(121:3) {:then loggedUserData}",
    		ctx
    	});

    	return block;
    }

    // (141:4) {:else}
    function create_else_block_2(ctx) {
    	let t0;
    	let li0;
    	let a0;
    	let t1;
    	let strong;
    	let t2_value = /*loggedUserData*/ ctx[1].userName + "";
    	let t2;
    	let t3;
    	let li1;
    	let a1;
    	let if_block = /*loggedUserData*/ ctx[1].userName == "admin" && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			li0 = element("li");
    			a0 = element("a");
    			t1 = text("Zalogowany jako: ");
    			strong = element("strong");
    			t2 = text(t2_value);
    			t3 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Wyloguj";
    			add_location(strong, file$2, 149, 24, 3807);
    			attr_dev(a0, "class", "nav-link");
    			attr_dev(a0, "href", "/profil");
    			add_location(a0, file$2, 148, 6, 3746);
    			attr_dev(li0, "class", "nav-item");
    			add_location(li0, file$2, 147, 5, 3717);
    			attr_dev(a1, "href", "/logoutUser");
    			attr_dev(a1, "class", "nav-link text-primary");
    			add_location(a1, file$2, 155, 6, 3928);
    			attr_dev(li1, "class", "nav-item");
    			add_location(li1, file$2, 154, 5, 3899);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, li0, anchor);
    			append_dev(li0, a0);
    			append_dev(a0, t1);
    			append_dev(a0, strong);
    			append_dev(strong, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, li1, anchor);
    			append_dev(li1, a1);
    		},
    		p: function update(ctx, dirty) {
    			if (/*loggedUserData*/ ctx[1].userName == "admin") {
    				if (if_block) ; else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*loggedUserData*/ 2 && t2_value !== (t2_value = /*loggedUserData*/ ctx[1].userName + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(li0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(li1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(141:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (122:4) {#if loggedUserData.error_message}
    function create_if_block_3(ctx) {
    	let form;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;

    	const block = {
    		c: function create() {
    			form = element("form");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Register";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Login";
    			attr_dev(a0, "href", "/register");
    			attr_dev(a0, "class", "btn btn-sm btn-outline-primary");
    			add_location(a0, file$2, 124, 7, 3212);
    			attr_dev(li0, "class", "nav-item nav-link");
    			add_location(li0, file$2, 123, 6, 3173);
    			attr_dev(a1, "href", "/login");
    			attr_dev(a1, "class", "btn btn-sm btn-outline-success");
    			attr_dev(a1, "id", "login-btn");
    			add_location(a1, file$2, 131, 7, 3380);
    			attr_dev(li1, "class", "nav-item nav-link");
    			add_location(li1, file$2, 130, 6, 3341);
    			add_location(form, file$2, 122, 5, 3159);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, li0);
    			append_dev(li0, a0);
    			append_dev(form, t1);
    			append_dev(form, li1);
    			append_dev(li1, a1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(122:4) {#if loggedUserData.error_message}",
    		ctx
    	});

    	return block;
    }

    // (142:5) {#if loggedUserData.userName == "admin"}
    function create_if_block_4(ctx) {
    	let li;
    	let a;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			a.textContent = "Admin";
    			attr_dev(a, "class", "nav-link");
    			attr_dev(a, "href", "/admin");
    			add_location(a, file$2, 143, 7, 3640);
    			attr_dev(li, "class", "nav-item");
    			add_location(li, file$2, 142, 6, 3610);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(142:5) {#if loggedUserData.userName == \\\"admin\\\"}",
    		ctx
    	});

    	return block;
    }

    // (119:26)       <h1>Oczekiwanie na dane użytkownika</h1>     {:then loggedUserData}
    function create_pending_block_2(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Oczekiwanie na dane użytkownika";
    			add_location(h1, file$2, 119, 4, 3045);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_2.name,
    		type: "pending",
    		source: "(119:26)       <h1>Oczekiwanie na dane użytkownika</h1>     {:then loggedUserData}",
    		ctx
    	});

    	return block;
    }

    // (51:6) {#each navData as item}
    function create_each_block(ctx) {
    	let li;
    	let a;
    	let t_value = /*item*/ ctx[3].text + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", "nav-link mt-1");
    			attr_dev(a, "href", a_href_value = /*item*/ ctx[3].url);
    			add_location(a, file$2, 52, 8, 1435);
    			attr_dev(li, "class", "nav-item");
    			add_location(li, file$2, 51, 7, 1404);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navData*/ 4 && t_value !== (t_value = /*item*/ ctx[3].text + "")) set_data_dev(t, t_value);

    			if (dirty & /*navData*/ 4 && a_href_value !== (a_href_value = /*item*/ ctx[3].url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(51:6) {#each navData as item}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   import Search from "./Search.svelte";   import Switch from "./Switch.svelte";   export let vertical;     async function getLinks() {    let response = await fetch(`/getLinks?component=header`, {     method: "post"    }
    function create_catch_block$1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(1:0) <script>   import Search from \\\"./Search.svelte\\\";   import Switch from \\\"./Switch.svelte\\\";   export let vertical;     async function getLinks() {    let response = await fetch(`/getLinks?component=header`, {     method: \\\"post\\\"    }",
    		ctx
    	});

    	return block;
    }

    // (61:6) {:then loggedUserData}
    function create_then_block_1(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*loggedUserData*/ ctx[1].error_message) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1.name,
    		type: "then",
    		source: "(61:6) {:then loggedUserData}",
    		ctx
    	});

    	return block;
    }

    // (81:7) {:else}
    function create_else_block(ctx) {
    	let t0;
    	let li0;
    	let a0;
    	let t1;
    	let strong;
    	let t2_value = /*loggedUserData*/ ctx[1].userName + "";
    	let t2;
    	let t3;
    	let li1;
    	let a1;
    	let if_block = /*loggedUserData*/ ctx[1].userName == "admin" && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			li0 = element("li");
    			a0 = element("a");
    			t1 = text("Zalogowany jako: ");
    			strong = element("strong");
    			t2 = text(t2_value);
    			t3 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Wyloguj";
    			add_location(strong, file$2, 91, 28, 2483);
    			attr_dev(a0, "class", " nav-link mt-1");
    			attr_dev(a0, "href", "/profil");
    			add_location(a0, file$2, 90, 9, 2413);
    			attr_dev(li0, "class", "nav-item");
    			add_location(li0, file$2, 89, 8, 2381);
    			attr_dev(a1, "class", "text-primary nav-link mt-1");
    			attr_dev(a1, "href", "/logoutUser");
    			add_location(a1, file$2, 98, 9, 2624);
    			attr_dev(li1, "class", "nav-item");
    			add_location(li1, file$2, 97, 8, 2592);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, li0, anchor);
    			append_dev(li0, a0);
    			append_dev(a0, t1);
    			append_dev(a0, strong);
    			append_dev(strong, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, li1, anchor);
    			append_dev(li1, a1);
    		},
    		p: function update(ctx, dirty) {
    			if (/*loggedUserData*/ ctx[1].userName == "admin") {
    				if (if_block) ; else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*loggedUserData*/ 2 && t2_value !== (t2_value = /*loggedUserData*/ ctx[1].userName + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(li0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(li1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(81:7) {:else}",
    		ctx
    	});

    	return block;
    }

    // (62:7) {#if loggedUserData.error_message}
    function create_if_block_1(ctx) {
    	let form;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;

    	const block = {
    		c: function create() {
    			form = element("form");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Register";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Login";
    			attr_dev(a0, "href", "/register");
    			attr_dev(a0, "class", "btn btn-sm btn-outline-primary");
    			add_location(a0, file$2, 64, 10, 1780);
    			attr_dev(li0, "class", "nav-item nav-link");
    			add_location(li0, file$2, 63, 9, 1738);
    			attr_dev(a1, "href", "/login");
    			attr_dev(a1, "class", "btn btn-sm btn-outline-success");
    			attr_dev(a1, "id", "login-btn");
    			add_location(a1, file$2, 71, 10, 1969);
    			attr_dev(li1, "class", "nav-item nav-link");
    			add_location(li1, file$2, 70, 9, 1927);
    			attr_dev(form, "class", "d-flex");
    			add_location(form, file$2, 62, 8, 1706);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, li0);
    			append_dev(li0, a0);
    			append_dev(form, t1);
    			append_dev(form, li1);
    			append_dev(li1, a1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(62:7) {#if loggedUserData.error_message}",
    		ctx
    	});

    	return block;
    }

    // (82:8) {#if loggedUserData.userName == "admin"}
    function create_if_block_2(ctx) {
    	let li;
    	let a;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			a.textContent = "Admin";
    			attr_dev(a, "class", "nav-link mt-1");
    			attr_dev(a, "href", "/admin");
    			add_location(a, file$2, 83, 10, 2265);
    			attr_dev(li, "class", "nav-item");
    			add_location(li, file$2, 82, 9, 2232);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(82:8) {#if loggedUserData.userName == \\\"admin\\\"}",
    		ctx
    	});

    	return block;
    }

    // (59:29)          <h1>Oczekiwanie na dane użytkownika</h1>        {:then loggedUserData}
    function create_pending_block_1(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Oczekiwanie na dane użytkownika";
    			add_location(h1, file$2, 59, 7, 1583);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1.name,
    		type: "pending",
    		source: "(59:29)          <h1>Oczekiwanie na dane użytkownika</h1>        {:then loggedUserData}",
    		ctx
    	});

    	return block;
    }

    // (29:16)    <h1>Oczekiwanie na dane nawigacji</h1>  {:then navData}
    function create_pending_block$1(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Oczekiwanie na dane nawigacji";
    			add_location(h1, file$2, 29, 1, 759);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(29:16)    <h1>Oczekiwanie na dane nawigacji</h1>  {:then navData}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block_2,
    		value: 2,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*navData*/ ctx[2], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*navData*/ 4 && promise !== (promise = /*navData*/ ctx[2]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[2] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
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

    async function getLinks() {
    	let response = await fetch(`/getLinks?component=header`, { method: "post" });
    	let responseJson = await response.json();
    	console.log("response nav: ", responseJson);
    	return responseJson;
    }

    async function getLoggedUser() {
    	let response = await fetch(`/getLoggedUserData`, { method: "post" });
    	let responseJson = await response.json();
    	console.log("response logUser: ", responseJson);
    	return responseJson;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { vertical } = $$props;
    	let loggedUserData = getLoggedUser();
    	let navData = getLinks();
    	const writable_props = ["vertical"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Navigation> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navigation", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("vertical" in $$props) $$invalidate(0, vertical = $$props.vertical);
    	};

    	$$self.$capture_state = () => ({
    		Search,
    		Switch,
    		vertical,
    		getLinks,
    		getLoggedUser,
    		loggedUserData,
    		navData
    	});

    	$$self.$inject_state = $$props => {
    		if ("vertical" in $$props) $$invalidate(0, vertical = $$props.vertical);
    		if ("loggedUserData" in $$props) $$invalidate(1, loggedUserData = $$props.loggedUserData);
    		if ("navData" in $$props) $$invalidate(2, navData = $$props.navData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(2, navData = getLinks());
    	 $$invalidate(1, loggedUserData = getLoggedUser());
    	return [vertical, loggedUserData, navData];
    }

    class Navigation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { vertical: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigation",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*vertical*/ ctx[0] === undefined && !("vertical" in props)) {
    			console_1.warn("<Navigation> was created without expected prop 'vertical'");
    		}
    	}

    	get vertical() {
    		throw new Error("<Navigation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Navigation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* \ad514i\Homes$\pboron\CMSProject\frontend\svelte\src\Slider.svelte generated by Svelte v3.24.1 */

    const { console: console_1$1 } = globals;
    const file$3 = "\\ad514i\\Homes$\\pboron\\CMSProject\\frontend\\svelte\\src\\Slider.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (1:0) <script>   export let id;   console.log("ID Slidera: ", id);     async function getSliderData(id) {    let response = await fetch(`/getSliderData?id=${id}
    function create_catch_block$2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(1:0) <script>   export let id;   console.log(\\\"ID Slidera: \\\", id);     async function getSliderData(id) {    let response = await fetch(`/getSliderData?id=${id}",
    		ctx
    	});

    	return block;
    }

    // (18:0) {:then sliderData}
    function create_then_block$2(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let button0;
    	let span0;
    	let t2;
    	let span1;
    	let t4;
    	let button1;
    	let span2;
    	let t5;
    	let span3;
    	let each_value_1 = /*sliderData*/ ctx[0].slides;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*sliderData*/ ctx[0].slides;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			button0 = element("button");
    			span0 = element("span");
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "Previous";
    			t4 = space();
    			button1 = element("button");
    			span2 = element("span");
    			t5 = space();
    			span3 = element("span");
    			span3.textContent = "Next";
    			attr_dev(div0, "class", "carousel-indicators");
    			add_location(div0, file$3, 19, 2, 572);
    			attr_dev(div1, "class", "carousel-inner");
    			add_location(div1, file$3, 35, 2, 1050);
    			attr_dev(span0, "class", "carousel-control-prev-icon");
    			attr_dev(span0, "aria-hidden", "true");
    			add_location(span0, file$3, 57, 3, 1925);
    			attr_dev(span1, "class", "visually-hidden");
    			add_location(span1, file$3, 58, 3, 1992);
    			attr_dev(button0, "class", "carousel-control-prev");
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "data-bs-target", "#carouselExampleDark");
    			attr_dev(button0, "data-bs-slide", "prev");
    			add_location(button0, file$3, 56, 2, 1809);
    			attr_dev(span2, "class", "carousel-control-next-icon");
    			attr_dev(span2, "aria-hidden", "true");
    			add_location(span2, file$3, 61, 3, 2170);
    			attr_dev(span3, "class", "visually-hidden");
    			add_location(span3, file$3, 62, 3, 2237);
    			attr_dev(button1, "class", "carousel-control-next");
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "data-bs-target", "#carouselExampleDark");
    			attr_dev(button1, "data-bs-slide", "next");
    			add_location(button1, file$3, 60, 2, 2054);
    			attr_dev(div2, "id", "carouselExampleDark");
    			attr_dev(div2, "class", "carousel carousel-dark slide");
    			attr_dev(div2, "data-bs-ride", "carousel");
    			add_location(div2, file$3, 18, 1, 477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t0);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, button0);
    			append_dev(button0, span0);
    			append_dev(button0, t2);
    			append_dev(button0, span1);
    			append_dev(div2, t4);
    			append_dev(div2, button1);
    			append_dev(button1, span2);
    			append_dev(button1, t5);
    			append_dev(button1, span3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sliderData*/ 1) {
    				each_value_1 = /*sliderData*/ ctx[0].slides;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*sliderData*/ 1) {
    				each_value = /*sliderData*/ ctx[0].slides;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(18:0) {:then sliderData}",
    		ctx
    	});

    	return block;
    }

    // (31:4) {:else}
    function create_else_block_1$1(ctx) {
    	let button;
    	let button_data_bs_slide_to_value;
    	let button_aria_label_value;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-bs-target", "#carouselExampleDark");
    			attr_dev(button, "data-bs-slide-to", button_data_bs_slide_to_value = /*idx*/ ctx[4]);
    			attr_dev(button, "aria-label", button_aria_label_value = "Slide " + /*idx*/ ctx[4]);
    			add_location(button, file$3, 31, 5, 900);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(31:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#if slide.order == 1}
    function create_if_block_1$1(ctx) {
    	let button;
    	let button_data_bs_slide_to_value;
    	let button_aria_label_value;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-bs-target", "#carouselExampleDark");
    			attr_dev(button, "data-bs-slide-to", button_data_bs_slide_to_value = /*idx*/ ctx[4]);
    			attr_dev(button, "aria-label", button_aria_label_value = "Slide " + /*idx*/ ctx[4]);
    			attr_dev(button, "class", "active");
    			attr_dev(button, "aria-current", "true");
    			add_location(button, file$3, 22, 5, 684);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(22:4) {#if slide.order == 1}",
    		ctx
    	});

    	return block;
    }

    // (21:3) {#each sliderData.slides as slide, idx}
    function create_each_block_1$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*slide*/ ctx[2].order == 1) return create_if_block_1$1;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(21:3) {#each sliderData.slides as slide, idx}",
    		ctx
    	});

    	return block;
    }

    // (46:4) {:else}
    function create_else_block$1(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let h5;
    	let t1_value = /*slide*/ ctx[2].title + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*slide*/ ctx[2].subtitle + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h5 = element("h5");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			if (img.src !== (img_src_value = "/uploads/slider/" + /*slide*/ ctx[2].img_url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "d-block slider-picture");
    			attr_dev(img, "alt", "...");
    			add_location(img, file$3, 47, 6, 1537);
    			add_location(h5, file$3, 49, 7, 1691);
    			add_location(p, file$3, 50, 7, 1722);
    			attr_dev(div0, "class", "carousel-caption d-none d-md-block");
    			add_location(div0, file$3, 48, 6, 1634);
    			attr_dev(div1, "class", "carousel-item");
    			attr_dev(div1, "data-bs-interval", "9000");
    			add_location(div1, file$3, 46, 5, 1478);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h5);
    			append_dev(h5, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, t3);
    			append_dev(div1, t4);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(46:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (38:4) {#if slide.order == 1}
    function create_if_block$1(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let h5;
    	let t1_value = /*slide*/ ctx[2].title + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*slide*/ ctx[2].subtitle + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h5 = element("h5");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			if (img.src !== (img_src_value = "/uploads/slider/" + /*slide*/ ctx[2].img_url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "d-block slider-picture");
    			attr_dev(img, "alt", "...");
    			add_location(img, file$3, 39, 6, 1223);
    			add_location(h5, file$3, 41, 7, 1377);
    			add_location(p, file$3, 42, 7, 1408);
    			attr_dev(div0, "class", "carousel-caption d-none d-md-block");
    			add_location(div0, file$3, 40, 6, 1320);
    			attr_dev(div1, "class", "carousel-item active");
    			attr_dev(div1, "data-bs-interval", "9000");
    			add_location(div1, file$3, 38, 5, 1157);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h5);
    			append_dev(h5, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, t3);
    			append_dev(div1, t4);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(38:4) {#if slide.order == 1}",
    		ctx
    	});

    	return block;
    }

    // (37:3) {#each sliderData.slides as slide, idx}
    function create_each_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*slide*/ ctx[2].order == 1) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(37:3) {#each sliderData.slides as slide, idx}",
    		ctx
    	});

    	return block;
    }

    // (16:19)    <h1>Oczekiwanie na dane slidera</h1>  {:then sliderData}
    function create_pending_block$2(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Oczekiwanie na dane slidera";
    			add_location(h1, file$3, 16, 1, 418);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(16:19)    <h1>Oczekiwanie na dane slidera</h1>  {:then sliderData}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 0
    	};

    	handle_promise(promise = /*sliderData*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[0] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
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

    async function getSliderData(id) {
    	let response = await fetch(`/getSliderData?id=${id}`, { method: "post" });
    	let responseJson = await response.json();
    	console.log("responseJson: ", responseJson);
    	return responseJson;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	console.log("ID Slidera: ", id);
    	let sliderData = getSliderData(id);
    	console.log("SliderData: ", sliderData);
    	const writable_props = ["id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Slider", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({ id, getSliderData, sliderData });

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("sliderData" in $$props) $$invalidate(0, sliderData = $$props.sliderData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [sliderData, id];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { id: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[1] === undefined && !("id" in props)) {
    			console_1$1.warn("<Slider> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* \ad514i\Homes$\pboron\CMSProject\frontend\svelte\src\Footer.svelte generated by Svelte v3.24.1 */

    const { console: console_1$2 } = globals;
    const file$4 = "\\ad514i\\Homes$\\pboron\\CMSProject\\frontend\\svelte\\src\\Footer.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>   export let sticky = false;   async function getLinks() {    let response = await fetch(`/getLinks?component=footer`, { method: "post" }
    function create_catch_block$3(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$3.name,
    		type: "catch",
    		source: "(1:0) <script>   export let sticky = false;   async function getLinks() {    let response = await fetch(`/getLinks?component=footer`, { method: \\\"post\\\" }",
    		ctx
    	});

    	return block;
    }

    // (20:0) {:then footerData}
    function create_then_block$3(ctx) {
    	let div1;
    	let div0;
    	let footer;
    	let ul;
    	let t0;
    	let p;
    	let each_value = /*footerData*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			footer = element("footer");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			p = element("p");
    			p.textContent = "© 2021 Company, Inc";
    			attr_dev(ul, "class", "nav justify-content-center border-bottom pb-2 mb-2");
    			add_location(ul, file$4, 23, 3, 604);
    			attr_dev(p, "class", "text-center text-muted");
    			add_location(p, file$4, 30, 3, 842);
    			attr_dev(footer, "class", "pt-3 mt-4");
    			add_location(footer, file$4, 22, 2, 573);
    			attr_dev(div0, "class", "container");
    			toggle_class(div0, "fixed-bottom", /*sticky*/ ctx[0]);
    			add_location(div0, file$4, 21, 1, 518);
    			attr_dev(div1, "class", "content");
    			add_location(div1, file$4, 20, 0, 494);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, footer);
    			append_dev(footer, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(footer, t0);
    			append_dev(footer, p);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*footerData*/ 2) {
    				each_value = /*footerData*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*sticky*/ 1) {
    				toggle_class(div0, "fixed-bottom", /*sticky*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$3.name,
    		type: "then",
    		source: "(20:0) {:then footerData}",
    		ctx
    	});

    	return block;
    }

    // (25:4) {#each footerData as item}
    function create_each_block$2(ctx) {
    	let li;
    	let a;
    	let t0_value = /*item*/ ctx[2].text + "";
    	let t0;
    	let a_href_value;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", a_href_value = /*item*/ ctx[2].url);
    			attr_dev(a, "class", "nav-link px-2 text-muted");
    			add_location(a, file$4, 26, 6, 735);
    			attr_dev(li, "class", "nav-item");
    			add_location(li, file$4, 25, 5, 706);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*footerData*/ 2 && t0_value !== (t0_value = /*item*/ ctx[2].text + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*footerData*/ 2 && a_href_value !== (a_href_value = /*item*/ ctx[2].url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(25:4) {#each footerData as item}",
    		ctx
    	});

    	return block;
    }

    // (18:19)    <h1>Oczekiwanie na dane stopki</h1>  {:then footerData}
    function create_pending_block$3(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Oczekiwanie na dane stopki";
    			add_location(h1, file$4, 18, 1, 437);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$3.name,
    		type: "pending",
    		source: "(18:19)    <h1>Oczekiwanie na dane stopki</h1>  {:then footerData}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$3,
    		then: create_then_block$3,
    		catch: create_catch_block$3,
    		value: 1
    	};

    	handle_promise(promise = /*footerData*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*footerData*/ 2 && promise !== (promise = /*footerData*/ ctx[1]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[1] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
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

    async function getLinks$1() {
    	let response = await fetch(`/getLinks?component=footer`, { method: "post" });
    	let responseJson = await response.json();
    	console.log("response ff: ", responseJson);
    	return responseJson;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { sticky = false } = $$props;
    	let footerData = getLinks$1();
    	console.log("FooterData: ", footerData, footerData[0]);
    	const writable_props = ["sticky"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("sticky" in $$props) $$invalidate(0, sticky = $$props.sticky);
    	};

    	$$self.$capture_state = () => ({ sticky, getLinks: getLinks$1, footerData });

    	$$self.$inject_state = $$props => {
    		if ("sticky" in $$props) $$invalidate(0, sticky = $$props.sticky);
    		if ("footerData" in $$props) $$invalidate(1, footerData = $$props.footerData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 {
    		$$invalidate(1, footerData = getLinks$1());
    	}

    	return [sticky, footerData];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { sticky: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get sticky() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sticky(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* \ad514i\Homes$\pboron\CMSProject\frontend\svelte\src\Card.svelte generated by Svelte v3.24.1 */

    const { console: console_1$3 } = globals;
    const file$5 = "\\ad514i\\Homes$\\pboron\\CMSProject\\frontend\\svelte\\src\\Card.svelte";

    // (1:0) <script>      export let id;      console.log("ID Card: ", id);        async function getArticleData(id) {    let response = await fetch(`/getArticleData?id=${id}
    function create_catch_block$4(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$4.name,
    		type: "catch",
    		source: "(1:0) <script>      export let id;      console.log(\\\"ID Card: \\\", id);        async function getArticleData(id) {    let response = await fetch(`/getArticleData?id=${id}",
    		ctx
    	});

    	return block;
    }

    // (21:0) {:then cardData}
    function create_then_block$4(ctx) {
    	let div1;
    	let div0;
    	let h5;
    	let t0_value = /*cardData*/ ctx[1].title + "";
    	let t0;
    	let t1;
    	let p;
    	let t2_value = /*cardData*/ ctx[1].subtitle + "";
    	let t2;
    	let t3;
    	let a;
    	let t4;
    	let t5;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			a = element("a");
    			t4 = text("Go to article ");
    			t5 = text(/*id*/ ctx[0]);
    			attr_dev(h5, "class", "card-title");
    			add_location(h5, file$5, 23, 8, 607);
    			attr_dev(p, "class", "card-text");
    			add_location(p, file$5, 24, 8, 661);
    			attr_dev(a, "href", a_href_value = "./article?id=" + /*id*/ ctx[0]);
    			attr_dev(a, "class", "btn btn-secondary card-button");
    			add_location(a, file$5, 27, 8, 739);
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$5, 22, 4, 574);
    			attr_dev(div1, "class", "card");
    			set_style(div1, "width", "18rem");
    			add_location(div1, file$5, 21, 0, 529);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h5);
    			append_dev(h5, t0);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(p, t2);
    			append_dev(div0, t3);
    			append_dev(div0, a);
    			append_dev(a, t4);
    			append_dev(a, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cardData*/ 2 && t0_value !== (t0_value = /*cardData*/ ctx[1].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*cardData*/ 2 && t2_value !== (t2_value = /*cardData*/ ctx[1].subtitle + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*id*/ 1) set_data_dev(t5, /*id*/ ctx[0]);

    			if (dirty & /*id*/ 1 && a_href_value !== (a_href_value = "./article?id=" + /*id*/ ctx[0])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$4.name,
    		type: "then",
    		source: "(21:0) {:then cardData}",
    		ctx
    	});

    	return block;
    }

    // (19:17)       <h1>Oczekiwanie na dane atykułu</h1>  {:then cardData}
    function create_pending_block$4(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Oczekiwanie na dane atykułu";
    			add_location(h1, file$5, 19, 4, 472);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$4.name,
    		type: "pending",
    		source: "(19:17)       <h1>Oczekiwanie na dane atykułu</h1>  {:then cardData}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$4,
    		then: create_then_block$4,
    		catch: create_catch_block$4,
    		value: 1
    	};

    	handle_promise(promise = /*cardData*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*cardData*/ 2 && promise !== (promise = /*cardData*/ ctx[1]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[1] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
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

    async function getArticleData(id) {
    	let response = await fetch(`/getArticleData?id=${id}`, { method: "post" });
    	let responseJson = await response.json();
    	console.log("response: ", responseJson);
    	return responseJson;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	console.log("ID Card: ", id);
    	let cardData = getArticleData(id);
    	console.log("CardData: ", cardData);
    	const writable_props = ["id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Card", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({ id, getArticleData, cardData });

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("cardData" in $$props) $$invalidate(1, cardData = $$props.cardData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*id*/ 1) {
    			 {
    				$$invalidate(1, cardData = getArticleData(id));
    			}
    		}
    	};

    	return [id, cardData];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { id: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console_1$3.warn("<Card> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* \ad514i\Homes$\pboron\CMSProject\frontend\svelte\src\News.svelte generated by Svelte v3.24.1 */

    const { console: console_1$4 } = globals;
    const file$6 = "\\ad514i\\Homes$\\pboron\\CMSProject\\frontend\\svelte\\src\\News.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>      import Card from "./Card.svelte"        async function getLatestArticles(count) {    let response = await fetch(`/getLatestArticlesIDs?count=${count}
    function create_catch_block$5(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$5.name,
    		type: "catch",
    		source: "(1:0) <script>      import Card from \\\"./Card.svelte\\\"        async function getLatestArticles(count) {    let response = await fetch(`/getLatestArticlesIDs?count=${count}",
    		ctx
    	});

    	return block;
    }

    // (20:47)           {#each latestArticles.latestArticlesIDs as latestArticle}
    function create_then_block$5(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*latestArticles*/ ctx[0].latestArticlesIDs;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*latestArticles*/ 1) {
    				each_value = /*latestArticles*/ ctx[0].latestArticlesIDs;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$5.name,
    		type: "then",
    		source: "(20:47)           {#each latestArticles.latestArticlesIDs as latestArticle}",
    		ctx
    	});

    	return block;
    }

    // (21:8) {#each latestArticles.latestArticlesIDs as latestArticle}
    function create_each_block$3(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: { id: /*latestArticle*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};
    			if (dirty & /*latestArticles*/ 1) card_changes.id = /*latestArticle*/ ctx[1];
    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(21:8) {#each latestArticles.latestArticlesIDs as latestArticle}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>      import Card from "./Card.svelte"        async function getLatestArticles(count) {    let response = await fetch(`/getLatestArticlesIDs?count=${count}
    function create_pending_block$5(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$5.name,
    		type: "pending",
    		source: "(1:0) <script>      import Card from \\\"./Card.svelte\\\"        async function getLatestArticles(count) {    let response = await fetch(`/getLatestArticlesIDs?count=${count}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$5,
    		then: create_then_block$5,
    		catch: create_catch_block$5,
    		value: 0,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*latestArticles*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			attr_dev(div, "class", "d-flex flex-row bd-highlight mb-3 news-div content");
    			add_location(div, file$6, 18, 0, 434);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*latestArticles*/ 1 && promise !== (promise = /*latestArticles*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[0] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
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

    async function getLatestArticles(count) {
    	let response = await fetch(`/getLatestArticlesIDs?count=${count}`, { method: "post" });
    	let responseJson = await response.json();
    	console.log("latestArticles: ", responseJson);
    	return responseJson;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let latestArticles = getLatestArticles(3);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<News> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("News", $$slots, []);
    	$$self.$capture_state = () => ({ Card, getLatestArticles, latestArticles });

    	$$self.$inject_state = $$props => {
    		if ("latestArticles" in $$props) $$invalidate(0, latestArticles = $$props.latestArticles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 {
    		$$invalidate(0, latestArticles = getLatestArticles(3));
    	}

    	return [latestArticles];
    }

    class News extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "News",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* \ad514i\Homes$\pboron\CMSProject\frontend\svelte\src\Featurette.svelte generated by Svelte v3.24.1 */

    const { console: console_1$5 } = globals;
    const file$7 = "\\ad514i\\Homes$\\pboron\\CMSProject\\frontend\\svelte\\src\\Featurette.svelte";

    // (1:0) <script>   export let id;   console.log("ID Featurette: ", id);     async function getFeaturetteData(id) {    let response = await fetch(`/getFeaturetteData?id=${id}
    function create_catch_block$6(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$6.name,
    		type: "catch",
    		source: "(1:0) <script>   export let id;   console.log(\\\"ID Featurette: \\\", id);     async function getFeaturetteData(id) {    let response = await fetch(`/getFeaturetteData?id=${id}",
    		ctx
    	});

    	return block;
    }

    // (16:31)   <div class="content">   <hr class="featurette-divider" />   <div class="featurette row">    <div class="featurette-text col-12 col-lg-5 col-xl-6">     <h2 class="featurette-heading">      {featData.title}
    function create_then_block$6(ctx) {
    	let div3;
    	let hr0;
    	let t0;
    	let div2;
    	let div0;
    	let h2;
    	let t1_value = /*featData*/ ctx[0].title + "";
    	let t1;
    	let t2;
    	let span;
    	let t3_value = /*featData*/ ctx[0].subtitle + "";
    	let t3;
    	let t4;
    	let p;
    	let t5_value = /*featData*/ ctx[0].content + "";
    	let t5;
    	let t6;
    	let div1;
    	let img;
    	let img_src_value;
    	let t7;
    	let hr1;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			hr0 = element("hr");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			span = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			p = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			div1 = element("div");
    			img = element("img");
    			t7 = space();
    			hr1 = element("hr");
    			attr_dev(hr0, "class", "featurette-divider");
    			add_location(hr0, file$7, 17, 1, 478);
    			attr_dev(span, "class", "text-muted");
    			add_location(span, file$7, 22, 4, 664);
    			attr_dev(h2, "class", "featurette-heading");
    			add_location(h2, file$7, 20, 3, 605);
    			attr_dev(p, "class", "lead");
    			add_location(p, file$7, 24, 3, 730);
    			attr_dev(div0, "class", "featurette-text col-12 col-lg-5 col-xl-6");
    			add_location(div0, file$7, 19, 2, 546);
    			if (img.src !== (img_src_value = `/uploads/featurettes/${/*featData*/ ctx[0].img_url}`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Featurette Image");
    			add_location(img, file$7, 30, 3, 908);
    			attr_dev(div1, "class", "col-12 col-lg-7 col-xl-6 d-flex justify-center");
    			add_location(div1, file$7, 28, 2, 793);
    			attr_dev(div2, "class", "featurette row");
    			add_location(div2, file$7, 18, 1, 514);
    			attr_dev(hr1, "class", "featurette-divider");
    			add_location(hr1, file$7, 33, 1, 1009);
    			attr_dev(div3, "class", "content");
    			add_location(div3, file$7, 16, 0, 454);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, hr0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(h2, span);
    			append_dev(span, t3);
    			append_dev(div0, t4);
    			append_dev(div0, p);
    			append_dev(p, t5);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div3, t7);
    			append_dev(div3, hr1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$6.name,
    		type: "then",
    		source: "(16:31)   <div class=\\\"content\\\">   <hr class=\\\"featurette-divider\\\" />   <div class=\\\"featurette row\\\">    <div class=\\\"featurette-text col-12 col-lg-5 col-xl-6\\\">     <h2 class=\\\"featurette-heading\\\">      {featData.title}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let id;   console.log("ID Featurette: ", id);     async function getFeaturetteData(id) {    let response = await fetch(`/getFeaturetteData?id=${id}
    function create_pending_block$6(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$6.name,
    		type: "pending",
    		source: "(1:0) <script>   export let id;   console.log(\\\"ID Featurette: \\\", id);     async function getFeaturetteData(id) {    let response = await fetch(`/getFeaturetteData?id=${id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$6,
    		then: create_then_block$6,
    		catch: create_catch_block$6,
    		value: 0
    	};

    	handle_promise(promise = /*featData*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[0] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
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

    async function getFeaturetteData(id) {
    	let response = await fetch(`/getFeaturetteData?id=${id}`, { method: "post" });
    	let responseJson = await response.json();
    	console.log("responseJson: ", responseJson);
    	return responseJson;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	console.log("ID Featurette: ", id);
    	let featData = getFeaturetteData(id);
    	console.log("FeatData: ", featData, featData.title);
    	const writable_props = ["id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<Featurette> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Featurette", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({ id, getFeaturetteData, featData });

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("featData" in $$props) $$invalidate(0, featData = $$props.featData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [featData, id];
    }

    class Featurette extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { id: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Featurette",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[1] === undefined && !("id" in props)) {
    			console_1$5.warn("<Featurette> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<Featurette>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Featurette>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* \ad514i\Homes$\pboron\CMSProject\frontend\svelte\src\App.svelte generated by Svelte v3.24.1 */

    const { console: console_1$6 } = globals;
    const file$8 = "\\ad514i\\Homes$\\pboron\\CMSProject\\frontend\\svelte\\src\\App.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let navigation;
    	let t0;
    	let slider;
    	let t1;
    	let news;
    	let t2;
    	let featurette;
    	let t3;
    	let footer;
    	let current;

    	navigation = new Navigation({
    			props: { vertical: false },
    			$$inline: true
    		});

    	slider = new Slider({ props: { id: "1" }, $$inline: true });
    	news = new News({ $$inline: true });
    	featurette = new Featurette({ props: { id: "1" }, $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navigation.$$.fragment);
    			t0 = space();
    			create_component(slider.$$.fragment);
    			t1 = space();
    			create_component(news.$$.fragment);
    			t2 = space();
    			create_component(featurette.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    			add_location(main, file$8, 11, 0, 294);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navigation, main, null);
    			append_dev(main, t0);
    			mount_component(slider, main, null);
    			append_dev(main, t1);
    			mount_component(news, main, null);
    			append_dev(main, t2);
    			mount_component(featurette, main, null);
    			append_dev(main, t3);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navigation.$$.fragment, local);
    			transition_in(slider.$$.fragment, local);
    			transition_in(news.$$.fragment, local);
    			transition_in(featurette.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navigation.$$.fragment, local);
    			transition_out(slider.$$.fragment, local);
    			transition_out(news.$$.fragment, local);
    			transition_out(featurette.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navigation);
    			destroy_component(slider);
    			destroy_component(news);
    			destroy_component(featurette);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	console.log("Name: ", name);
    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$6.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		Navigation,
    		Slider,
    		Footer,
    		News,
    		Featurette
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console_1$6.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        name: "Main",
      },
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
