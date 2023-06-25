from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import datetime
current_time = datetime.datetime.now()

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

with open('data.json', "r") as f:
    POSTS = json.loads(f.read())

def dump_json(storage_lst):
    with open('data.json', 'w') as f:
        f.write(json.dumps(storage_lst))

def validate_post_data(data):
    if "title" not in data or "content" not in data or "author" not in data:
        return False
    return True

def find_post_by_id(id):
    for post in POSTS:
        if post["id"] == id:
            return post
    return None

@app.route('/api/posts', methods=['GET'])
def get_posts():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 5))
    start_index = (page - 1) * limit
    end_index = start_index + limit
    sort = request.args.get('sort')
    direction = request.args.get('direction')
    if start_index >= len(POSTS):
        return jsonify({"error": "Page out of range"}), 400
    if sort is not None and direction is not None:
        if sort.lower() == "title":
            if direction.lower() == "asc":
                sorted_posts = sorted(POSTS, key=lambda d: d['title'])
                return jsonify(sorted_posts[start_index:end_index])
            elif direction.lower() == "desc":
                sorted_posts = sorted(POSTS, key=lambda d: d['title'], reverse=True)
                return jsonify(sorted_posts[start_index:end_index])
        elif sort.lower() == "content":
            if direction.lower() == "asc":
                sorted_posts = sorted(POSTS, key=lambda d: d['content'])
                return jsonify(sorted_posts[start_index:end_index])
            elif direction.lower() == "desc":
                sorted_posts = sorted(POSTS, key=lambda d: d['content'], reverse=True)
                return jsonify(sorted_posts[start_index:end_index])
        elif sort.lower() == "author":
            if direction.lower() == "asc":
                sorted_posts = sorted(POSTS, key=lambda d: d['author'])
                return jsonify(sorted_posts[start_index:end_index])
            elif direction.lower() == "desc":
                sorted_posts = sorted(POSTS, key=lambda d: d['author'], reverse=True)
                return jsonify(sorted_posts[start_index:end_index])
        return jsonify({"error": "Invalid sort or direction"}), 400
    return jsonify(POSTS[start_index:end_index])

@app.route('/api/posts', methods=['POST'])
def add_post():
    new_post = request.get_json()
    if not validate_post_data(new_post):
        return jsonify({"error": "Invalid post data"}), 400
    if not POSTS:
        new_id = 1
    else:
        new_id = max(post['id'] for post in POSTS) + 1
    new_post['likes'] = 0
    new_post['id'] = new_id
    new_post['author'] = new_post["author"]
    new_post['comments'] = []
    new_post['date'] = current_time.strftime("%Y-%m-%d %H:%M:%S")
    POSTS.insert(0, new_post)
    dump_json(POSTS)
    return jsonify(new_post), 201

@app.route('/api/posts/<int:id>', methods=['DELETE'])
def delete_book(id):
    post = find_post_by_id(id)
    if post is None:
        return jsonify({"error": "Post not found"}), 404
    POSTS.remove(post)
    dump_json(POSTS)
    return jsonify(post)

@app.route('/api/posts/<int:id>', methods=['PUT'])
def update_post(id):
    post = find_post_by_id(id)
    if post is None:
        return jsonify({"error": "Post not found"}), 404
    new_data = request.get_json()
    post.update(new_data)
    dump_json(POSTS)
    return jsonify(post)

@app.route('/api/posts/<int:id>/comments', methods=['PUT'])
def add_comment(id):
    post = find_post_by_id(id)
    if post is None:
        return jsonify({"error": "Post not found"}), 404
    new_data = request.get_json()
    if "comment" not in new_data:
        return jsonify({"error": "Invalid comment data"}), 400
    comment = " " + new_data["comment"]
    post["comments"].append(comment)
    dump_json(POSTS)
    return jsonify(post)

@app.route('/api/posts/<int:id>/likes', methods=['PUT'])
def add_like(id):
    post = find_post_by_id(id)
    if post is None:
        return jsonify({"error": "Post not found"}), 404
    post["likes"] += 1
    dump_json(POSTS)
    return jsonify(post)

@app.route('/api/posts/search', methods=['GET'])
def search_post():
    title = request.args.get('title')
    content = request.args.get('content')
    author = request.args.get('author')
    if title or content or author:
        filtered_posts = [
            post for post in POSTS
            if (title is None or title.lower() in post['title'].lower()) and
               (content is None or content.lower() in post['content'].lower()) and
               (author is None or author.lower() == post['author'].lower())
        ]
        return jsonify(filtered_posts)
    else:
        return jsonify([])

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5002, debug=True)
