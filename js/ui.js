const ui = {
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        clearOutput();
    },

    closeModal() {
        document.getElementById('modal').classList.remove('active');
    },

    showModal(content) {
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('modal').classList.add('active');
    }
};

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        ui.closeModal();
    }
};
