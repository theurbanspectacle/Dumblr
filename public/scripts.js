mdc.autoInit();
/** @type {number|undefined} */
let currentPost = undefined;
let allPosts = [];

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour12: true, hour: 'numeric', minute: '2-digit'});
}

const navHome = () => {
    window.location.href = '/';
};

const navDashboard = () => {
    window.location.href = '/dashboard';
};

const navLogin = () => {
    window.location.href = '/login';
};

const navLogout = () => {
    window.location.href = '/logout';
};

const navSignup = () => {
    window.location.href = '/sign-up';
};

const showFormError = () => {
    mdc.banner.MDCBanner.attachTo(document.querySelector('#invalid-form-banner')).open();
};

const dismissFormError = () => {
    mdc.banner.MDCBanner.attachTo(document.querySelector('#invalid-form-banner')).close();
};

const loginAction = () => {
    const username = document.querySelector('#login-username input').value;
    const password = document.querySelector('#login-password input').value;
  
    if (!username || !password) {
        showFormError();
        return;
    }

    axios.post('/api/user/login', {username, password}).then(data => {
        navHome();
    }).catch(error => {
        showFormError();
        console.error('Unable to login', error);
    });
};

const signupAction = () => {
    const username = document.querySelector('#signup-username input').value;
    const password = document.querySelector('#signup-password input').value;
  
    if (!username || !password) {
        showFormError();
        return;
    }

    axios.post('/api/user', {username, password}).then(data => {
        navHome();
    }).catch(error => {
        console.error('Unable to sign up', error);
    });
};

const loginEnter = (event) => {
    if (event.which === 13) {
        loginAction();
      }
};

const signupEnter = (event) => {
    if (event.which === 13) {
        signupAction();
      }
};

const stopLoading = () => {
    const loader = document.querySelector('#loading');

    if (loader) {
        loader.remove();
    }
};

const getNoResults = () => {
    return `
    <div class="mdc-card content-card">
        <p class="mdc-typography--headline4">No posts</p>
        <p class="mdc-typography--body1">Create some or check back later for new blog posts!</p>
    </div>`
};

const getPosts = () => {
    axios.get('/api/post').then(data => {
        stopLoading();
        allPosts = data.data;
        const container = document.querySelector('#content-container');
        const loggedIn = !!data.headers.get('X-Current-User');

        const addButton = `
        <button class="mdc-fab mdc-fab--touch" title="Create new post" onclick="newPost()">
            <div class="mdc-fab__ripple"></div>
            <span class="material-icons mdc-fab__icon">add</span>
            <div class="mdc-fab__touch"></div>
        </button>
        `;

        const posts = allPosts.map(item => {
            const comments = (item.comments || []).map(comment => {
                return `
                <div class="mdc-card comment-card">
                    <p class="mdc-typography--body1">${comment.content}</p>
                    <p class="mdc-typography--caption">Comment by ${comment.user.username} on ${formatDate(comment.created_at)}</p>
                </div>
                `;
            });

            const actions = `
            <div class="mdc-card__actions">
                <button class="mdc-button mdc-card__action mdc-card__action--button" onclick="newComment(${item.id})">
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">Comment</span>
                </button>
            </div>
            `;

            return `
            <div class="mdc-card content-card">
                <p class="mdc-typography--headline4">${item.title}</p>
                <p class="mdc-typography--body1">${item.content}</p>
                <p class="mdc-typography--caption">Posted by ${item.user.username} on ${formatDate(item.created_at)}</p>
                ${comments.join('')}
                ${loggedIn ? actions : ''}
            </div>
            `;
        });

        container.innerHTML = `
        ${loggedIn ? addButton : ''}
        ${posts.length ? posts.join('') : getNoResults()}
        `;
    }).catch(error => {
        console.error('Unable to get posts', error);
        stopLoading();
    })
};

const getMyPosts = () => {
    axios.get('/api/post/mine').then(data => {
        stopLoading();
        allPosts = data.data;
        const container = document.querySelector('#content-container');

        const posts = allPosts.map(item => {
            const comments = (item.comments || []).map(comment => {
                return `
                <div class="mdc-card comment-card">
                    <p class="mdc-typography--body1">${comment.content}</p>
                    <p class="mdc-typography--caption">Comment by ${comment.user.username} on ${formatDate(comment.created_at)}</p>
                </div>
                `;
            });

            const actions = `
            <div class="mdc-card__actions">
                <button class="mdc-button mdc-card__action mdc-card__action--button" onclick="editPost(${item.id})">
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">Edit</span>
                </button>
                <button class="mdc-button mdc-card__action mdc-card__action--button" onclick="deletePost(${item.id})">
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">Delete</span>
                </button>
            </div>
            `;

            return `
            <div class="mdc-card content-card">
                <p class="mdc-typography--headline4">${item.title}</p>
                <p class="mdc-typography--body1">${item.content}</p>
                <p class="mdc-typography--caption">Posted by ${item.user.username} on ${formatDate(item.created_at)}</p>
                ${comments.join('')}
                ${actions}
            </div>
            `;
        });

        container.innerHTML = posts.length ? posts.join('') : getNoResults();
    }).catch(error => {
        console.error('Unable to get posts', error);
        stopLoading();
    })
};

const editPost = (id) => {
    currentPost = id;
    const foundPost = allPosts.find(item => item.id === id) || {};
    document.querySelector('#create-post-title input').value = foundPost.title;
    document.querySelector('#create-post-content textarea').value = foundPost.content;
    newPost();
};

const newPost = () => {
    mdc.dialog.MDCDialog.attachTo(document.querySelector('#create-post')).open();
};

const cancelPost = () => {
    mdc.dialog.MDCDialog.attachTo(document.querySelector('#create-post')).close();
    currentPost = undefined;
};

const savePost = () => {
    mdc.dialog.MDCDialog.attachTo(document.querySelector('#create-post')).close();

    const title = document.querySelector('#create-post-title input').value;
    const content = document.querySelector('#create-post-content textarea').value;
  
    if (!title || !content) {
        showFormError();
        return;
    }

    axios[currentPost ? 'put' : 'post'](`/api/post${currentPost ? `/${currentPost}` : ''}`, {content, title}).then(() => {
        document.querySelector('#create-post-title input').value = '';
        document.querySelector('#create-post-content textarea').value = '';
        currentPost ? getMyPosts() : getPosts();
        currentPost = undefined;
    }).catch(error => {
        console.error('Unable to create post', error);
        currentPost = undefined;
    });
};

const newComment = (id) => {
    currentPost = id;
    mdc.dialog.MDCDialog.attachTo(document.querySelector('#create-comment')).open();
};

const cancelComment = () => {
    mdc.dialog.MDCDialog.attachTo(document.querySelector('#create-comment')).close();
    currentPost = undefined;
};

const saveComment = () => {
    mdc.dialog.MDCDialog.attachTo(document.querySelector('#create-comment')).close();

    const content = document.querySelector('#create-comment-content textarea').value;
  
    if (!content) {
        showFormError();
        return;
    }

    axios.post('/api/post/comment', {content, blog_post: currentPost}).then(() => {
        document.querySelector('#create-comment-content textarea').value = '';
        getPosts();
        currentPost = undefined;
    }).catch(error => {
        console.error('Unable to post comment', error);
        currentPost = undefined;
    });
};

const deletePost = (id) => {

    axios.delete(`/api/post/${id}`).then(() => {
        getMyPosts();
    }).catch(error => {
        console.error('Unable to delete post', error);
    });
};