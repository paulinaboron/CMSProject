from flask import Flask
from flask_bs4 import Bootstrap

app = Flask(__name__)
app.config['SECRET_KEY'] = '$92ji21uoh98'

bootstrap = Bootstrap(app)


@app.route('/')
def index():
    return "To jest początek tej strony, testuję tylko GITa"




if __name__ == '__main__':
    app.run(debug=True)
