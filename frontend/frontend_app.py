from flask import Flask, render_template, request, redirect, url_for
import json

app = Flask(__name__)

with open('accounts.json', "r") as f:
    storage_lst = json.loads(f.read())

@app.route('/index', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        for account in storage_lst:
            if username.lower() == account["username"].lower():
                if password == account["password"]:
                    return render_template("index.html", username=username)
                else:
                    error_message = "Incorrect password"
                    return render_template("login.html", error_message=error_message)
        error_message = "Username not found"
        return render_template("login.html", error_message=error_message)

@app.route('/', methods=['GET', 'POST'])
def login():
    return render_template("login.html")

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        if password != confirm_password:
            error_message = "Passwords do not match"
            return render_template("register.html", error_message=error_message)

        for account in storage_lst:
            if username.lower() == account["username"].lower():
                error_message = "Username already exists"
                return render_template("register.html", error_message=error_message)

        new_account = {"username": username, "password": password}
        storage_lst.append(new_account)

        with open('accounts.json', 'w') as f:
            f.write(json.dumps(storage_lst))

        return redirect(url_for('login'))

    return render_template("register.html")

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
