export const showModal = (title, contentHtml) => {
    let modal = document.getElementById('genericModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'genericModal';
        modal.className = 'modal';
        modal.innerHTML = `<div class="modal-content"><span class="close-modal">&times;</span><div id="modal-body"></div></div>`;
        document.body.appendChild(modal);
    }
    document.getElementById('modal-body').innerHTML = `<h3>${title}</h3>${contentHtml}`;
    modal.style.display = 'flex';
    modal.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
};

export const hideModal = () => {
    const modal = document.getElementById('genericModal');
    if (modal) modal.style.display = 'none';
};
