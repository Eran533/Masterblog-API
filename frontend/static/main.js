var currentPage = 1;
var limit = 5;
var commentsCache = {}; // Cache to store comments for each post

// Function that runs once the window is fully loaded
window.onload = function() {
    // Attempt to retrieve the API base URL from the local storage
    var savedBaseUrl = localStorage.getItem('apiBaseUrl');
    // If a base URL is found in local storage, load the posts
    if (savedBaseUrl) {
        document.getElementById('api-base-url').value = savedBaseUrl;
        loadPosts();
    }
}

function loadPosts() {
    var baseUrl = document.getElementById('api-base-url').value;
    localStorage.setItem('apiBaseUrl', baseUrl);

    fetch(baseUrl + '/posts?page=' + currentPage + '&limit=' + limit)
        .then(response => response.json())
        .then(data => {
            const postContainer = document.getElementById('post-container');
            postContainer.innerHTML = '';

            data.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                postDiv.innerHTML = `<div class="post">
    <div class="button-container">
        <button onclick="deletePost(${post.id})" class="delete-button">Delete</button>
        <button onclick="updatePost(${post.id})" class="update-button">Update</button>
    </div>
    <h2>${post.title}</h2>
    <h3>${post.author}</h3>
    <h3>${post.date}</h3>
    <p id="post-content-${post.id}" class="post-content">${post.content}</p>
    <div class="comment-section">
        <h3>Comments:</h3>
        <h4>${post.comments}</h4>
        <ul id="comments-${post.id}" class="comments-list"></ul>
        <input type="text" id="comment-input-${post.id}" placeholder="Add a comment">
        <button onclick="addComment(${post.id})" class="add-comment-button">Add Comment</button>
    </div>
</div>
    <div class="like-section">
        <button onclick="likePost(${post.id})" class="like-button" id="like-button-${post.id}">
            <img src="static/icons8-like-64.png" alt="Logo" width="30" height="30">
        </button>
        <p class="like-text" id="like-count-${post.id}">Likes: ${post.likes}</p>
    </div>`;
                postContainer.appendChild(postDiv);
                fetch(baseUrl + '/posts/' + post.id + '/comments')
                    .then(response => response.json())
                    .then(comments => {
                        displayComments(post.id, comments);
                    })
                    .catch(error => console.error('Error:', error));
            });

            const previousPageButton = document.getElementById('previous-page');
            if (currentPage > 1) {
                previousPageButton.style.display = 'inline-block';
                previousPageButton.className = 'previous-page';
            } else {
                previousPageButton.style.display = 'none';
            }

            const nextPageButton = document.getElementById('next-page');
            if (data.length === limit) {
                nextPageButton.style.display = 'inline-block';
                nextPageButton.className = 'next-page';
            } else {
                nextPageButton.style.display = 'none';
            }

            const currentPageNumber = document.getElementById('current-page');
            currentPageNumber.textContent = currentPage;
            currentPageNumber.style.color = '#4466ee';
        })
        .catch(error => console.error('Error:', error));
}

function displayComments(postId, comments) {
    const commentsList = document.getElementById('comments-' + postId);
    commentsList.innerHTML = '';

    comments.forEach(comment => {
        const commentItem = document.createElement('li');
        commentItem.textContent = comment;
        commentsList.appendChild(commentItem);
    });
}

function addPost() {
    // Retrieve the values from the input fields
    var baseUrl = document.getElementById('api-base-url').value;
    var postTitle = document.getElementById('post-title').value;
    var postAuthor = document.getElementById('post-author').value;
    var postContent = document.getElementById('post-content').value;
    var currentDate = new Date().toISOString().slice(0, 10);

    fetch(baseUrl + '/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: postTitle, content: postContent, date: currentDate , author: postAuthor})
    })
    .then(response => response.json())  // Parse the JSON data from the response
    .then(post => {
        console.log('Post added:', post);
        loadPosts(); // Reload the posts after adding a new one
    })
    .catch(error => console.error('Error:', error));  // If an error occurs, log it to the console
}

// Function to send a DELETE request to the API to delete a post
function deletePost(postId) {
    var baseUrl = document.getElementById('api-base-url').value;

    // Use the Fetch API to send a DELETE request to the specific post's endpoint
    fetch(baseUrl + '/posts/' + postId, {
        method: 'DELETE'
    })
    .then(response => {
        console.log('Post deleted:', postId);
        loadPosts(); // Reload the posts after deleting one
    })
    .catch(error => console.error('Error:', error));  // If an error occurs, log it to the console
}

function searchPosts() {
    var baseUrl = document.getElementById('api-base-url').value;
    var searchAuthor = document.getElementById('search_author').value;
    var searchTitle = document.getElementById('search_title').value;
    var searchContent = document.getElementById('search_content').value;

    // Build the search query parameters based on the provided values
    var queryParams = '';
    if (searchAuthor) {
        queryParams += 'author=' + searchAuthor + '&';
    }
    if (searchTitle) {
        queryParams += 'title=' + searchTitle + '&';
    }
    if (searchContent) {
        queryParams += 'content=' + searchContent + '&';
    }

    // Remove the trailing '&' character from the query parameters
    if (queryParams.endsWith('&')) {
        queryParams = queryParams.slice(0, -1);
    }

    // Use the Fetch API to send a GET request to the /posts/search endpoint with the search parameters
    fetch(baseUrl + '/posts/search?' + queryParams)
        .then(response => response.json())
        .then(data => {
            // Handle the search results as desired
            console.log('Search results:', data);
            displayPosts(data);
        })
        .catch(error => console.error('Error:', error));
}

function nextPage() {
    var baseUrl = document.getElementById('api-base-url').value;

    // Use the Fetch API to send a GET request to the /posts endpoint with an increased page value
    fetch(baseUrl + '/posts?page=' + (currentPage + 1) + '&limit=' + limit)
        .then(response => response.json())  // Parse the JSON data from the response
        .then(data => {
            if (data.length > 0) {
                // If there are more posts available, increment the currentPage variable and load the posts
                currentPage++;
                loadPosts();
            } else {
                // If there are no more posts available, display a message or take appropriate action
                console.log('No more posts available.');
                // You can display an alert, disable the next page button, or handle it in any way you prefer
            }
        })
        .catch(error => console.error('Error:', error));  // If an error occurs, log it to the console
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadPosts();
    }
}

function updatePost(postId) {
    var baseUrl = document.getElementById("api-base-url").value;
    var postContentElement = document.getElementById("post-content-" + postId);

    var textarea = document.createElement("textarea");
    textarea.className = "editable-textarea";
    textarea.value = postContentElement.textContent;

    postContentElement.innerHTML = "";
    postContentElement.appendChild(textarea);

    var saveButton = document.createElement("button");
    saveButton.className = "save-button";
    saveButton.textContent = "Save";
    saveButton.onclick = function() {
        var updatedContent = textarea.value;

        fetch(baseUrl + "/posts/" + postId, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: updatedContent }),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log("Post updated:", data);
            postContentElement.innerHTML = updatedContent;
        })
        .catch((error) => console.error("Error:", error));
    };

    postContentElement.appendChild(saveButton);
}

// Function to add a comment to a post
function addComment(postId) {
  var baseUrl = document.getElementById('api-base-url').value;
  var commentInput = document.getElementById('comment-input-' + postId);
  var commentText = commentInput.value;

  // Use the Fetch API to send a PUT request to the specific post's comments endpoint
  fetch(baseUrl + '/posts/' + postId + '/comments', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment: commentText }) // Modify the key to 'comment' instead of 'comments'
  })
    .then(response => response.json())
    .then(updatedPost => {
      console.log('Comment added:', updatedPost);

      // Retrieve the comments list for the corresponding post
      var commentsList = document.getElementById('comments-' + postId);

      // Clear the existing comments
      commentsList.innerHTML = '';

      // Update the comments section with the updated comments
      updatedPost.comments.forEach(comment => {
        var commentItem = document.createElement('li');
        commentItem.textContent = comment;
        commentsList.appendChild(commentItem);
      });

      // Clear the comment input field
      commentInput.value = '';
    })
    .catch(error => console.error('Error:', error));
}

// Function to sort posts based on the selected criteria
function sortPosts() {
    var baseUrl = document.getElementById('api-base-url').value;
    var sortValue = document.getElementById('sort').value;
    var directionValue = document.getElementById('direction').value;

    // Use the Fetch API to send a GET request to the /api/posts endpoint with sort parameters
    fetch(baseUrl + '/posts?sort=' + sortValue + '&direction=' + directionValue)
        .then(response => response.json())
        .then(data => {
            // Handle the sorted posts as desired
            console.log('Sorted posts:', data);
            displayPosts(data);
        })
        .catch(error => console.error('Error:', error));
}

function displayPosts(posts) {
    const postContainer = document.getElementById('post-container');
    postContainer.innerHTML = '';

    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
                postDiv.innerHTML = `
                <h2>${post.title}</h2>
                <h3>${post.author}</h3>
                <h3>${post.date}</h3>
            <div class="button-container">
                <button onclick="deletePost(${post.id})" class="delete-button">Delete</button>
                <button onclick="updatePost(${post.id})" class="update-button">Update</button>
            </div>
            <p id="post-content-${post.id}">${post.content}</p>
                     <div class="comment-section">
      <h3>Comments:</h3>
      <h4>${post.comments}</h4>
      <ul id="comments-${post.id}" class="comments-list"></ul>
      <input type="text" id="comment-input-${post.id}" placeholder="Add a comment">
      <button onclick="addComment(${post.id})" class="add-comment-button">Add Comment</button>
    </div>`;
        postContainer.appendChild(postDiv);
    });
}

function likePost(postId) {
  var baseUrl = document.getElementById('api-base-url').value;

  // Use the Fetch API to send a PUT request to update the likes count for the post
  fetch(baseUrl + '/posts/' + postId + '/likes', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(updatedPost => {
      console.log('Post liked:', updatedPost);

      // Update the likes count in the UI
      var likeCountElement = document.getElementById('like-count-' + postId);
      likeCountElement.textContent = 'Likes: ' + updatedPost.likes;
    })
    .catch(error => console.error('Error:', error));
}
