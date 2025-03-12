(function() {
  const sadEmoji = chrome.runtime.getURL('./Dislikes.png');
  const evilEmoji = chrome.runtime.getURL('./Likes.png');
  const efgImage = chrome.runtime.getURL('./EFG.png');

  const dislikes = new Image();
  dislikes.src = sadEmoji;
  dislikes.alt = 'Sad Emoji';
  dislikes.onerror = () => console.error('Dislike image failed to load');
  dislikes.onload = () => console.log('Dislike image loaded successfully');
  const likes = new Image();
  likes.src = evilEmoji;
  likes.alt = 'Evil Emoji';
  likes.onerror = () => console.error('Like image failed to load');
  likes.onload = () => console.log('Like image loaded successfully');
  const efgImg = new Image();
  efgImg.src = efgImage;
  efgImg.alt = 'EFG Logo';
  efgImg.onerror = () => console.error('EFG image failed to load at pre-load stage');
  efgImg.onload = () => console.log('EFG image loaded successfully at pre-load stage');

  if (document.getElementById('evil-forum')) return;
  if (!document.body) return;

  const currentUrl = window.location.href;

  const forumDiv = document.createElement('div');
  forumDiv.id = 'evil-forum';
  forumDiv.style.cssText = `
      position: fixed;
      resize: both;
      margin: 5px;
      bottom: 10px;
      right: 5px;
      width: 300px;
      max-height: 700px;
      overflow-y: auto;
      background: #4B0082 !important;
      color: #000000 !important;
      border: 1px solid #ccc;
      padding: 5px;
      z-index: 9999;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      box-sizing: border-box;
      transition: all 0.3s ease;
  `;
  document.body.appendChild(forumDiv);

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'toggle-btn';
  toggleBtn.textContent = '-';
  toggleBtn.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      color: #000000 !important;
      background: #4B0082 !important;
      border: 1px solid #ccc;
      padding: 2px 8px;
      cursor: pointer;
      font-size: 12px;
      z-index: 10000;
  `;
  forumDiv.appendChild(toggleBtn);

  const imageContainer = document.createElement('div');
  imageContainer.id = 'efg-image-container';
  imageContainer.style.cssText = `
      display: none;
      text-align: center;
      margin: auto;
      padding: 5px;
      cursor: pointer;
  `;
  const efgImageElement = document.createElement('img');
  efgImageElement.src = efgImage;
  efgImageElement.alt = 'EFG Logo';
  efgImageElement.style.width = '50px';
  efgImageElement.onerror = () => console.error('EFG image failed to load in DOM');
  efgImageElement.onload = () => console.log('EFG image loaded successfully in DOM');
  imageContainer.appendChild(efgImageElement);
  forumDiv.appendChild(imageContainer);

  const title = document.createElement('h3');
  title.textContent = `Forum for ${new URL(currentUrl).hostname}`;
  title.style.cssText = `
      margin: 0 0 10px;
      color: #FFFFFF !important;
      background: #4B0082 !important;
      text-align: center;
      font-size: 16px;
      font-weight: bold;
  `;
  forumDiv.appendChild(title);

  const commentList = document.createElement('div');
  commentList.id = 'comment-list';
  commentList.textContent = 'No comments yet';
  commentList.style.cssText = `
      color: #000000 !important;
      background: #4B0082 !important;
      margin-bottom: 10px;
  `;
  forumDiv.appendChild(commentList);

  const form = document.createElement('form');
  form.style.cssText = `
      display: flex;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
      padding: 5px;
  `;
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Add a comment...';
  input.id = 'top-level-input';
  input.style.cssText = `
      flex: 1;
      color: #000000 !important;
      background: #ADD8E6 !important;
      border: 1px solid #ccc;
      padding: 5px;
      margin-right: 5px;
      box-sizing: border-box;
      min-width: 50px;
  `;
  const submitBtn = document.createElement('button');
  submitBtn.textContent = 'Post';
  submitBtn.style.cssText = `
      color: #000000 !important;
      background: #ADD8E6 !important;
      border: 1px solid #ccc;
      padding: 5px 10px;
      cursor: pointer;
      box-sizing: border-box;
  `;
  form.appendChild(input);
  form.appendChild(submitBtn);
  forumDiv.appendChild(form);

  // Function to set placeholder color
  function setPlaceholderColor(element, color) {
    const styleId = `${element.id}-placeholder-style`;
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = `
      #${element.id}::placeholder {
        color: ${color} !important;
      }
    `;
  }

  setPlaceholderColor(input, '#888888');

  const replyVisibilityState = new Map();
  let isMinimized = false;
  let activeReplyForm = null; // Track the currently active reply form globally

  const toggleForum = () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      forumDiv.style.width = '80px';
      forumDiv.style.maxHeight = '80px';
      forumDiv.style.padding = '5px';
      forumDiv.style.borderRadius = '50%';
      forumDiv.style.overflow = 'hidden';
      forumDiv.style.margin = 'auto';
      forumDiv.style.resize = 'both';
      commentList.style.display = 'none';
      form.style.display = 'none';
      title.style.display = 'none';
      toggleBtn.style.display = 'none';
      imageContainer.style.display = 'flex';
      imageContainer.style.margin = 'auto';
      imageContainer.style.width = '50px';
      imageContainer.style.height = '50px';
      imageContainer.style.paddingTop = '9px';
    } else {
      forumDiv.style.width = '300px';
      forumDiv.style.maxHeight = '700px';
      forumDiv.style.padding = '10px';
      forumDiv.style.borderRadius = '4px';
      forumDiv.style.overflowY = 'auto';
      forumDiv.style.margin = '5px';
      commentList.style.display = 'block';
      form.style.display = 'flex';
      title.style.display = 'block';
      toggleBtn.style.display = 'block';
      imageContainer.style.display = 'none';
    }
  };

  toggleBtn.addEventListener('click', toggleForum);
  imageContainer.addEventListener('click', toggleForum);

  chrome.runtime.sendMessage({ request: 'getToken' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('forum.js: Message error:', chrome.runtime.lastError.message);
      commentList.textContent = 'Error getting token';
      return;
    }
    const token = response ? response.token : null;
    if (!token || token === 'null' || token === '') {
      commentList.textContent = 'Please log in to view comments';
      return;
    }
    const ID = response ? response.id : null
    
    const paginationDiv = document.createElement('div');
    paginationDiv.id = 'pagination-controls';
    paginationDiv.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
        color: #000000 !important;
        background: #ADD8E6 !important;
    `;
    forumDiv.appendChild(paginationDiv);

    let currentPage = 1;
    const commentsPerPage = 10;
    let totalTopLevelComments = 0;

    const updatePagination = () => {
      paginationDiv.innerHTML = '';
      const totalPages = Math.ceil(totalTopLevelComments / commentsPerPage);
      
      const prevBtn = document.createElement('button');
      prevBtn.textContent = 'Previous';
      prevBtn.style.cssText = `
          color: #000000 !important;
          background: #ADD8E6 !important;
          border: 1px solid #ccc;
          padding: 5px 10px;
          cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'};
          opacity: ${currentPage === 1 ? 0.5 : 1};
      `;
      prevBtn.disabled = currentPage === 1;
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) fetchComments(currentPage - 1);
      });
      
      const pageInfo = document.createElement('span');
      pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
      pageInfo.style.cssText = `
          color: #000000 !important;
          background: #ADD8E6 !important;
      `;
      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'Next';
      nextBtn.style.cssText = `
          color: #000000 !important;
          background: #ADD8E6 !important;
          border: 1px solid #ccc;
          padding: 5px 10px;
          cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'};
          opacity: ${currentPage === totalPages ? 0.5 : 1};
      `;
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) fetchComments(currentPage + 1);
      });
    
      paginationDiv.appendChild(prevBtn);
      paginationDiv.appendChild(pageInfo);
      paginationDiv.appendChild(nextBtn);
    };    
// Utility function to decode HTML entities
function decodeHTMLEntities(text) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

const renderComment = (comment, level = 0, container) => {
  const commentWrapper = document.createElement('div');
  commentWrapper.style.cssText = `margin-bottom: 10px; position: relative;`;

  // Fixed indentation: 0px for top-level, 20px for all replies
  const indent = level === 0 ? 0 : 20;
  const border = document.createElement('div');
  
  // Debug to ensure variables are defined
  console.log("Indent:", indent, "Border:", border);

  // Split the assignment for clarity
  const borderStyles = `border: 1px solid #ccc; margin-left: ${indent}px; padding: 5px; background: #87CEEB; border-radius: 4px; position: relative;`;
  border.style.cssText = borderStyles;

  const username = document.createElement('p');
  username.textContent = `${comment.username} :`;
  username.style.cssText = `color: #000000 !important; font-size: 16px; font-weight: bold; margin: 0 0 5px 0;`;

  const p = document.createElement('p');
  // Decode HTML entities in the comment text
  const decodedComment = decodeHTMLEntities(comment.comment);
  console.log("Decoded comment text:", decodedComment);
  p.textContent = decodedComment;
  p.style.cssText = `margin: 0 0 5px 0; color: #000000 !important; background: transparent !important;`;

  const p1 = document.createElement('p');
  p1.textContent = `Title: ${comment.title}`;
  p1.style.cssText = `margin: 0 0 5px 0; color: #000000 !important; background: transparent !important;`;

  const likeBtn = document.createElement('button');
  likeBtn.style.cssText = `margin-right: 5px; color: #000000 !important; background: transparent !important; border: none; padding: 5px; cursor: pointer; display: inline-flex; align-items: center;`;
  const likeImg = likes.cloneNode(true);
  likeImg.style.width = '40px';
  likeBtn.appendChild(likeImg);
  likeBtn.appendChild(document.createTextNode(` ${comment.likes}`));
  likeBtn.addEventListener('click', () => {
    if (!token) {
      alert('Please log in to like posts');
      return;
    }
    fetch(`https://evilgeniusfoundation-3b5e54342af3.herokuapp.com/api/likes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ posts_id: comment.id })
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(() => fetchComments(currentPage))
      .catch(err => console.error('forum.js: Like failed:', err));
  });

  const dislikeBtn = document.createElement('button');
  dislikeBtn.style.cssText = `margin-right: 5px; color: #000000 !important; background: transparent !important; border: none; padding: 5px; cursor: pointer; display: inline-flex; align-items: center;`;
  const dislikeImg = dislikes.cloneNode(true);
  dislikeImg.style.width = '40px';
  dislikeBtn.appendChild(dislikeImg);
  dislikeBtn.appendChild(document.createTextNode(` ${comment.dislikes}`));
  dislikeBtn.addEventListener('click', () => {
    if (!token) {
      alert('Please log in to dislike posts');
      return;
    }
    fetch(`https://evilgeniusfoundation-3b5e54342af3.herokuapp.com/api/dislikes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ posts_id: comment.id })
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(() => fetchComments(currentPage))
      .catch(err => console.error('forum.js: Dislike failed:', err));
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = `Delete`
  deleteBtn.style.cssText =`
  margin-left: 5px;
  color: #FFFFFF !important;
  background: #4B0082 !important;
  border: 1px solid #ccc;
  padding: 5px;
  cursor: pointer;
  font-size: 14px;
  `;

  deleteBtn.addEventListener('click', () => {
    if (!token) {
      alert('Please login to delete posts!')
      return;
    }
    fetch(`https://evilgeniusfoundation-3b5e54342af3.herokuapp.com/api/posts/${comment.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ post_id: comment.id})
    })
    .then(() => fetchComments(currentPage))
    .catch(err => console.error('forum.js: Delete failed:', err));
  })

  const replyContainer = document.createElement('div');
  replyContainer.className = `reply-container-${comment.id}`;
  replyContainer.style.cssText = `margin-left: ${level === 0 ? 20 : 20}px; margin-top: 5px; padding: 5px;`;
  const isRepliesVisible = replyVisibilityState.get(comment.id) || false;
  replyContainer.style.display = isRepliesVisible ? 'block' : 'none';

  const toggleRepliesBtn = document.createElement('button');
  toggleRepliesBtn.textContent = `${isRepliesVisible ? 'Hide' : 'Show'} Replies (${comment.replies?.length || 0})`;
  toggleRepliesBtn.style.cssText = `margin-left: 5px; color: #FFFFFF !important; background: #4B0082 !important; border: 1px solid #ccc; padding: 5px; cursor: pointer; font-size: 14px;`;
  toggleRepliesBtn.addEventListener('click', () => {
    const isHidden = replyContainer.style.display === 'none';
    replyContainer.style.display = isHidden ? 'block' : 'none';
    replyVisibilityState.set(comment.id, isHidden);
    toggleRepliesBtn.textContent = `${isHidden ? 'Hide' : 'Show'} Replies (${comment.replies?.length || 0})`;
  });

  const replyBtn = document.createElement('button');
  replyBtn.textContent = 'Reply';
  replyBtn.style.cssText = `
    margin-left: 5px;
    color: #000000 !important;
    background: transparent !important;
    border: none;
    padding: 5px;
    cursor: pointer;
    font-size: 14px;
  `;
  replyBtn.addEventListener('click', () => {
    if (!token) {
      alert('Please log in to reply');
      return;
    }

    // Remove the currently active reply form, if any
    if (activeReplyForm) {
      activeReplyForm.remove();
      activeReplyForm = null;
    }

    const isHidden = replyContainer.style.display === 'none';
    replyContainer.style.display = isHidden ? 'block' : 'none';
    replyVisibilityState.set(comment.id, isHidden);

    let replyForm = replyContainer.querySelector('.reply-form');
    if (replyForm) {
      replyForm.remove();
    }

    replyForm = document.createElement('div');
    replyForm.className = 'reply-form';
    const replyInput = document.createElement('input');
    replyInput.type = 'text';
    replyInput.placeholder = 'Type your reply...';
    replyInput.id = `reply-input-${comment.id}`;
    replyInput.style.cssText = `width: 70%; color: #000000 !important; background: #ADD8E6 !important; border: 1px solid #ccc; padding: 5px; margin-top: 5px; box-sizing: border-box;`;
    setPlaceholderColor(replyInput, '#888888');
    const replySubmit = document.createElement('button');
    replySubmit.textContent = 'Post Reply';
    replySubmit.style.cssText = `margin-left: 5px; color: #FFFFFF !important; background: #4B0082 !important; border: 1px solid #ccc; padding: 5px 10px; cursor: pointer;`;
    replySubmit.addEventListener('click', () => {
      const replyText = replyInput.value.trim();
      if (replyText) {
        fetch(`https://evilgeniusfoundation-3b5e54342af3.herokuapp.com/api/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ url: currentUrl, text: replyText, reply_of: comment.id })
        })
          .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
          .then(data => {
            replyForm.remove();
            activeReplyForm = null; // Clear active reply form
            replyBtn.textContent = 'Reply Again';
            const newReply = {
              id: data.post_id,
              comment: replyText,
              username: comment.username || 'Anonymous',
              title: comment.title,
              likes: 0,
              dislikes: 0,
              reply_of: comment.id,
              replies: []
            };
            if (!comment.replies) comment.replies = [];
            comment.replies.unshift(newReply); // Add to data, but we'll only render the new reply
            toggleRepliesBtn.textContent = `${replyVisibilityState.get(comment.id) ? 'Hide' : 'Show'} Replies (${comment.replies.length})`;
            
            // Clear replyContainer and render only the new reply
            replyContainer.innerHTML = '';
            const newReplyWrapper = document.createElement('div');
            renderComment(newReply, 1, newReplyWrapper); // Render at reply level
            replyContainer.appendChild(newReplyWrapper);
            
            fetchComments(currentPage); // Refresh the full comment list
          })
          .catch(err => console.error('Reply POST failed:', err));
      }
    });

    replyForm.appendChild(replyInput);
    replyForm.appendChild(replySubmit);
    p1.appendChild(replyForm);
    activeReplyForm = replyForm; // Set the new active reply form
  });

  p1.appendChild(likeBtn);
  p1.appendChild(dislikeBtn);
  if (ID === comment.genius_id){
    console.log("true")
  }else{
    console.log(ID, comment.genius_id)
  }
  if (ID === comment.genius_id){
    p1.appendChild(deleteBtn);
  }
  if (comment.replies && comment.replies.length > 0) {
    p1.appendChild(toggleRepliesBtn);
  }
  p1.appendChild(replyBtn);

  border.appendChild(username);
  border.appendChild(p);
  border.appendChild(p1);
  commentWrapper.appendChild(border);
  commentWrapper.appendChild(replyContainer);
  container.appendChild(commentWrapper);

  // Render existing replies with fixed indent
  if (comment.replies && Array.isArray(comment.replies)) {
    replyContainer.innerHTML = ''; // Clear to avoid duplicates
    comment.replies.forEach(reply => {
      const replyWrapper = document.createElement('div');
      renderComment(reply, 1, replyWrapper); // Fixed level for replies
      replyContainer.appendChild(replyWrapper);
    });
  }
};
    const fetchComments = (page = 1) => {
      currentPage = page;
      const offset = (page - 1) * commentsPerPage;
      
      fetch(`https://evilgeniusfoundation-3b5e54342af3.herokuapp.com/api/posts?url=${encodeURIComponent(currentUrl)}&limit=${commentsPerPage}&offset=${offset}&order=desc`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          console.log("Page:", currentPage, "Server Response:", data);
          const allComments = Array.isArray(data) ? data : data.comments || [];
          totalTopLevelComments = data.total_top_level ? data.total_top_level : 0;
          
          commentList.innerHTML = '';
          if (!allComments || allComments.length === 0) {
            commentList.textContent = 'No comments yet';
            updatePagination();
            return;
          }

          // Initialize top-level posts
          const topLevelCount = Math.min(commentsPerPage, totalTopLevelComments - offset);
          const topLevelPosts = allComments.slice(0, topLevelCount).map(comment => ({ ...comment, replies: [] }));
          
          // Create a map of all comments for efficient lookup
          const commentMap = new Map(allComments.map(comment => [comment.id, { ...comment, replies: [] }]));
          
          // Attach replies recursively
          allComments.forEach(comment => {
            if (comment.reply_of) {
              const parent = commentMap.get(comment.reply_of);
              if (parent) {
                if (!parent.replies) parent.replies = [];
                parent.replies.push(commentMap.get(comment.id));
              }
            }
          });

          // Set the replies for top-level posts from the map
          topLevelPosts.forEach(post => {
            post.replies = commentMap.get(post.id).replies || [];
          });

          console.log("Top Level Posts with Replies:", topLevelPosts);
          topLevelPosts.forEach(comment => renderComment(comment, 0, commentList));
          updatePagination();
        })
        .catch(err => {
          console.error('forum.js: Fetch comments failed:', err);
          commentList.textContent = 'Failed to load comments';
        });
    };

    form.onsubmit = (e) => {
      e.preventDefault();
      const text = document.getElementById('top-level-input').value.trim();
      if (!text) return;
      fetch(`https://evilgeniusfoundation-3b5e54342af3.herokuapp.com/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ url: currentUrl, text })
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          document.getElementById('top-level-input').value = '';
          const totalPages = Math.ceil((totalTopLevelComments + 1) / commentsPerPage);
          fetchComments(totalPages);
        })
        .catch(err => {
          console.error('forum.js: Post comment failed:', err);
          commentList.textContent = 'Failed to post comment';
        });
    };

    fetchComments(1);
  });
})();