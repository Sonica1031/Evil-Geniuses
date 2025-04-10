// const link = document.createElement("link");
// link.rel = "stylesheet";
// link.href = chrome.runtime.getURL("../css/fonts.css");
// document.head.appendChild(link);
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
      display: none;
      position: fixed;
      margin: 5px;
      bottom: 70px;
      right: 10px;
      width: 340px;
      max-height: 700px;
      overflow-y: auto;
      background: white !important;
      color: #000000 !important;
      border: 1px solid #ccc;
      border-radius: 10px;
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
      top: 10px;
      right: 10px;
      background: lightgray !important;
      border: 1px solid #ccc;
      padding: 0px 6px;
      cursor: pointer;
      font-size: 12px;
      z-index: 10000;
      color: black !important;
      background: lightgray !important;
      font-weight: 900;
      border-radius: 5px;
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
  title.textContent = `Forum ${getBaseDomain(window.location.hostname)}`;
  title.style.cssText = `
      margin: 0 0 10px;
      color: #4365B0 !important;
      text-align: left;
      font-size: 16px;
      font-weight: bold;
      border-bottom: 1px solid gray;
      padding: 5px;
  `;
  forumDiv.appendChild(title);
  function getBaseDomain(hostname) {
    const parts = hostname.replace(/^www\./, '').split('.');
    if (parts.length >= 2) {
        const domain = parts[parts.length - 2];
        return capitalize(domain);
    }
    return capitalize(hostname);
  }

  function capitalize(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
  }

  const commentList = document.createElement('div');
  commentList.id = 'comment-list';
  commentList.textContent = 'No Comments';
  commentList.style.cssText = `
      color: black !important;
      margin-bottom: 10px;
      min-height: 100px;
      max-height: 300px;
      overflow-y: auto;
      scroll-behavior: smooth;
      padding: 5px;
  `;
  forumDiv.appendChild(commentList);

  const form = document.createElement('form');
  form.style.cssText = `
      display: flex;
      align-items: center;
      gap: 5px;
      width: 100%;
      box-sizing: border-box;
      padding: 5px;
      flex-direction: column;
  `;
  const input = document.createElement('textarea');
  input.rows = 3;
  input.placeholder = 'Add a comment...';
  input.id = 'top-level-input';
  input.style.cssText = `
      flex: 1;
      color: #000000 !important;
      border: 1px solid #ccc;
      padding: 5px;
      width: 100%;
      border-radius: 10px;
      font-size: 12px;
  `;
  input.addEventListener('focus', () => {
    input.style.outline = 'none';
  });

  const submitBtn = document.createElement('button');
  submitBtn.textContent = 'POST';
  submitBtn.type = 'submit';
  submitBtn.style.cssText = `
      padding: 4px;
      cursor: pointer;
      color: white !important;
      background: #4D2A7C !important;
      width: 100%;
      border-radius: 50px;
      font-size: 13px;
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
  let isMinimized = true;
  let activeReplyForm = null; // Track the currently active reply form globally

  const toggleForum = () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      forumDiv.style.width = '0px';
      forumDiv.style.maxHeight = '0px';
      commentList.style.display = 'none';
      form.style.display = 'none';
      title.style.display = 'none';
      toggleBtn.style.display = 'none';
      forumDiv.style.display = 'none';
    } else {
      forumDiv.style.width = '340px';
      forumDiv.style.maxHeight = '700px';
      forumDiv.style.padding = '10px';
      forumDiv.style.borderRadius = '4px';
      forumDiv.style.overflowY = 'auto';
      forumDiv.style.margin = '5px';
      commentList.style.display = 'block';
      form.style.display = 'flex';
      title.style.display = 'block';
      toggleBtn.style.display = 'block';
      forumDiv.style.display = 'block';
      // imageContainer.style.display = 'none';
    }
  };

  toggleBtn.addEventListener('click', toggleForum);

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
        display: none;
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
      
      if (totalPages > 1) {
        paginationDiv.style.display = 'flex'; // Show pagination when more than one page
      } else {
        paginationDiv.style.display = 'none'; // Hide if only one page or no comments
      }

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
      const borderStyles = `margin-left: ${indent}px; padding: 5px; position: relative;`;
      border.style.cssText = borderStyles;

      const username = document.createElement('p');
      username.textContent = `${comment.username}`;
      username.style.cssText = `color: #000000 !important; font-size: 14px; font-weight: bold;`;

      const p = document.createElement('p');
      // Decode HTML entities in the comment text
      const decodedComment = decodeHTMLEntities(comment.comment);
      console.log("Decoded comment text:", decodedComment);
      p.textContent = decodedComment;
      p.style.cssText = `color: gray !important; font-size: 12px`;

      const p1 = document.createElement('p');
      // p1.textContent = `Title: ${comment.title}`;
      // p1.style.cssText = `margin: 0 0 5px 0; color: #000000 !important; background: transparent !important;`;

      const likeBtn = document.createElement('button');
      likeBtn.style.cssText = `
        margin-right: 10px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        color: gray !important;
        width: 30px;
        font-size: 16px;
      `;

      // Inline SVG as string
      const likeSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10.83 10.56" width="24" height="24" style="margin-right: 4px;">
        <path fill="#9b9a9a" d="M10.57,4.06c-.28-.4-.75-.63-1.29-.63l-2.06-.04.25-1.61c.15-.7-.29-1.47-.98-1.7-.58-.21-1.36.03-1.71.55l-1.41,2.1c-.21-.45-.67-.68-1.35-.68h-.51C.51,2.05,0,2.55,0,3.53v5c0,.98.51,1.47,1.51,1.47h.51c.67,0,1.11-.21,1.34-.64l.97.75c.33.33.92.45,1.33.45h1.94c.87,0,1.71-.64,1.9-1.42l1.22-3.71c.18-.48.12-.98-.15-1.37ZM2.54,8.53c0,.4-.04.47-.52.47h-.51c-.48,0-.51-.06-.51-.47V3.53c0-.4.03-.48.51-.48h.51c.48,0,.52.08.52.48v5ZM9.78,5.11l-1.24,3.76c-.09.37-.53.69-.94.69h-1.94c-.27,0-.56-.1-.67-.2l-1.45-1.12v-3.96l2.07-3.09c.08-.12.35-.24.55-.16.21.07.38.34.33.57l-.26,1.64c-.05.31.04.61.23.84.2.22.48.35.77.35h2.05c.21,0,.38.07.47.2.09.12.1.28.03.48Z"/>
      </svg>
      `;

      likeBtn.innerHTML = likeSVG + ` ${comment.likes}`;

      likeBtn.addEventListener('click', () => {
        if (!token) {
          alert('Please log in to like posts');
          return;
        }

        fetch(`https://evilgeniusfoundation-3b5e54342af3.herokuapp.com/api/likes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
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
      dislikeBtn.style.cssText = `
        margin-right: 10px;
        color: gray !important;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        width: 30px;
        font-size: 16px;
      `;

      // Inline SVG as string
      const dislikeSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10.83 10.56" width="24" height="24" style="margin-right: 4px;">
        <path fill="#9b9a9a" d="M9.31.56h-.51c-.67,0-1.11.21-1.34.64l-.97-.75c-.33-.33-.92-.45-1.33-.45h-1.94c-.87,0-1.71.64-1.9,1.42L.1,5.13c-.18.48-.12.99.15,1.37.28.4.75.63,1.29.63l2.07.04-.26,1.61c-.15.7.29,1.47.98,1.7.14.05.3.08.46.08.49,0,.99-.24,1.25-.63l1.41-2.1c.21.45.67.68,1.35.68h.51c1.01,0,1.52-.5,1.52-1.48V2.03c0-.98-.51-1.47-1.52-1.47ZM5.21,9.37c-.08.12-.34.24-.55.16-.22-.07-.38-.33-.33-.57l.26-1.64c.05-.31-.03-.61-.23-.84-.19-.22-.47-.35-.77-.35H1.54c-.21,0-.38-.07-.47-.2-.08-.12-.09-.28-.02-.47l1.23-3.77c.09-.37.53-.69.94-.69h1.94c.27,0,.56.09.67.2l1.45,1.12v3.96l-2.07,3.09ZM9.83,7.03c0,.41-.04.48-.52.48h-.51c-.48,0-.52-.07-.52-.48V2.03c0-.4.04-.47.52-.47h.51c.48,0,.52.06.52.47v5Z"/>
      </svg>
      `;

      dislikeBtn.innerHTML = dislikeSVG + ` ${comment.dislikes}`;

      dislikeBtn.addEventListener('click', () => {
        if (!token) {
          alert('Please log in to dislike posts');
          return;
        }

        fetch(`https://evilgeniusfoundation-3b5e54342af3.herokuapp.com/api/dislikes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ posts_id: comment.id })
        })
          .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
          .then(() => fetchComments(currentPage))
          .catch(err => console.error('forum.js: Dislike failed:', err));
      });

      const replyBtn = document.createElement('button');
      replyBtn.style.cssText = `
        margin-left: 10px;
        color: gray !important;
        border: none;
        cursor: pointer;
        font-size: 14px;
        display: inline-flex;
        align-items: center;
      `;

      // Inline SVG as a string
      const replySVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11.07 10.26" width="20" height="20" style="margin-right: 4px;">
        <path fill="#9b9a9a" d="M11.07,10.26l-2.58-1.29c-.12-.06-.17-.09-.22-.1-.04-.01-.08-.02-.12-.03-.06,0-.12,0-.24,0H2.29c-.68,0-1.06,0-1.41-.18-.3-.15-.55-.4-.71-.71-.18-.35-.18-.72-.18-1.41V2.29c0-.68,0-1.06.18-1.41.16-.31.4-.55.71-.71.35-.18.72-.18,1.41-.18h6.49c.68,0,1.06,0,1.41.18.31.16.55.4.71.71.18.35.18.72.18,1.41v7.97ZM2.29,1c-.51,0-.82,0-.95.07-.12.06-.21.15-.27.27-.07.13-.07.44-.07.95v4.25c0,.51,0,.82.07.95.06.12.15.21.27.27.13.07.44.07.95.07h5.62c.19,0,.29,0,.38.02.1.01.19.04.29.07.09.03.17.07.32.14l1.16.58V2.29c0-.51,0-.82-.07-.95-.06-.12-.15-.21-.27-.27-.13-.07-.44-.07-.95-.07H2.29ZM8.33,6.03H2.74v-1h5.59v1ZM8.33,3.8H2.74v-1h5.59v1Z"/>
      </svg>
      `;

      replyBtn.innerHTML = replySVG + `Reply`;

      const optionsBtn = document.createElement('button');
      optionsBtn.style.cssText = `
        margin-left: 10px;
        color: gray !important;
        border: none;
        cursor: pointer;
        font-size: 14px;
        display: inline-flex;
        align-items: center;
      `;

      // Inline SVG for the options button
      const optionsSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.58 2.03" width="20" height="20">
        <path fill="#9b9a9a" d="M2.06,1c0,.28-.1.52-.3.72-.2.2-.44.31-.72.31s-.54-.1-.74-.31c-.2-.21-.3-.45-.3-.72S.1.5.3.3c.2-.2.45-.3.74-.3s.52.1.72.3c.2.2.3.43.3.7Z"/>
        <path fill="#9b9a9a" d="M5.82,1c0,.28-.1.52-.3.72-.2.2-.44.31-.72.31s-.54-.1-.74-.31c-.2-.21-.3-.45-.3-.72s.1-.5.3-.7c.2-.2.45-.3.74-.3s.52.1.72.3c.2.2.3.43.3.7Z"/>
        <path fill="#9b9a9a" d="M9.58,1c0,.28-.1.52-.3.72-.2.2-.44.31-.72.31s-.54-.1-.74-.31c-.2-.21-.3-.45-.3-.72s.1-.5.3-.7c.2-.2.45-.3.74-.3s.52.1.72.3c.2.2.3.43.3.7Z"/>
      </svg>
      `;

      optionsBtn.innerHTML = optionsSVG;

      p1.style.position = 'relative'; // ensure relative for absolute dropdown

      p1.appendChild(likeBtn);
      p1.appendChild(dislikeBtn);
      p1.appendChild(replyBtn);
      p1.appendChild(optionsBtn);

      // Create dropdown menu
      const optionsMenu = document.createElement('div');
      optionsMenu.style.cssText = `
        display: none;
        position: absolute;
        top: 32px;
        right: 0;
        background: white;
        border: 1px solid #ccc;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        padding: 5px 0;
        z-index: 10000;
        min-width: 150px;
        flex-direction: column;
      `;


      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = `Delete`
      deleteBtn.style.cssText =`
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        padding: 8px 12px;
        font-size: 14px;
        color: #000;
        cursor: pointer;
      `;
      deleteBtn.addEventListener('mouseover', () => deleteBtn.style.background = '#f0f0f0');
      deleteBtn.addEventListener('mouseout', () => deleteBtn.style.background = 'transparent');

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
      toggleRepliesBtn.style.cssText = `
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        padding: 8px 12px;
        font-size: 14px;
        color: #000;
        cursor: pointer;
      `;
      toggleRepliesBtn.addEventListener('mouseover', () => toggleRepliesBtn.style.background = '#f0f0f0');
      toggleRepliesBtn.addEventListener('mouseout', () => toggleRepliesBtn.style.background = 'transparent');
      
      // Toggle menu visibility
      optionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const visible = optionsMenu.style.display === 'flex';
        optionsMenu.style.display = visible ? 'none' : 'flex';
      });
      
      // Hide dropdown when clicking outside
      document.addEventListener('click', () => {
        optionsMenu.style.display = 'none';
      });
      
      p1.appendChild(optionsMenu);

      toggleRepliesBtn.addEventListener('click', () => {
        const isHidden = replyContainer.style.display === 'none';
        replyContainer.style.display = isHidden ? 'block' : 'none';
        replyVisibilityState.set(comment.id, isHidden);
        toggleRepliesBtn.textContent = `${isHidden ? 'Hide' : 'Show'} Replies (${comment.replies?.length || 0})`;
      });

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
        const replyInput = document.createElement('textarea');
        replyInput.rows = 3;
        replyInput.placeholder = 'Type your reply...';
        replyInput.id = `reply-input-${comment.id}`;
        replyInput.style.cssText = `
            flex: 1;
            color: #000000 !important;
            border: 1px solid #ccc;
            padding: 5px;
            width: 100%;
            border-radius: 10px;
            font-size: 12px;
        `;
        input.addEventListener('focus', () => {
          input.style.outline = 'none';
        });

        setPlaceholderColor(replyInput, '#888888');
        const replySubmit = document.createElement('button');
        replySubmit.textContent = 'Post Reply';
        replySubmit.type = 'submit';
        replySubmit.style.cssText = `
            padding: 4px;
            cursor: pointer;
            color: white !important;
            background: #4D2A7C !important;
            width: 100%;
            border-radius: 50px;
            font-size: 13px;
        `;

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

      // Add buttons conditionally
      if (ID === comment.genius_id) {
        optionsMenu.appendChild(deleteBtn);
      }
      if (comment.replies && comment.replies.length > 0) {
        optionsMenu.appendChild(toggleRepliesBtn);
      }

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
            commentList.textContent = 'No Comments';
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
  
  function initExtBtn() {
    try {
      // Create a container for the button
      const buttonContainer = document.createElement("div");
      buttonContainer.id = "extIcon";
      buttonContainer.style.position = "fixed";
      buttonContainer.style.right = "10px"; // Position on the right
      buttonContainer.style.bottom = "-15px"; // Center vertically
      buttonContainer.style.transform = "translateY(-50%)";
      buttonContainer.style.zIndex = "99999999"; // Make sure it stays on top
      buttonContainer.style.cursor = "pointer";
      buttonContainer.style.background = "white";
      buttonContainer.style.padding = "1px";
      buttonContainer.style.borderRadius = "50px";
      buttonContainer.style.boxShadow = "0px 0px 3px 1px gray";
  
      // Create the button element
      const button = document.createElement("div");
      button.style.width = "50px";
      button.style.height = "50px";
      button.style.borderRadius = "50%";
      button.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  
      // Get the icon URL dynamically using the Chrome API
      const iconURL = chrome.runtime.getURL('./EFGplug.png');
      button.style.background = `url("${iconURL}") no-repeat center`;
      button.style.backgroundSize = "contain";
  
      buttonContainer.appendChild(button);
  
      // Append the button to the document body
      document.body.appendChild(buttonContainer);
      buttonContainer.addEventListener('click', toggleForum);
    } catch (error) {
      console.log("InitExtBtn error:", error);
    }
  }

  initExtBtn();
})();