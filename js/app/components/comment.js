import { gif } from './gif.js';
import { card } from './card.js';
import { like } from './like.js';
import { util } from '../../common/util.js';
import { pagination } from './pagination.js';
import { lang } from '../../common/language.js';
import { storage } from '../../common/storage.js';


const LS_KEY = 'wedding_comments_local';
const IS_ADMIN = false; // ubah true untuk admin

/* ===============================
 * STORAGE
 * =============================== */
const getLocalComments = () => {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY)) || [];
    } catch {
        return [];
    }
};

const saveLocalComments = (data) => {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
};

export const comment = (() => {

    let commentsEl = null;

    /* ===============================
     * EMPTY STATE
     * =============================== */
    const onNullComment = () => {
        const desc = lang
            .on('id', 'Belum ada komentar. Jadilah yang pertama ✨')
            .on('en', 'No comments yet. Be the first ✨')
            .get();

        return `
            <div class="text-center p-4 mb-3 bg-theme-auto rounded-4 shadow">
                <p class="fw-bold m-0">${desc}</p>
            </div>
        `;
    };

    /* ===============================
     * RENDER
     * =============================== */
    const render = (data) => {
        if (!data.length) {
            commentsEl.innerHTML = onNullComment();
            return;
        }

        commentsEl.innerHTML = '';

        [...data].reverse().forEach(item => {
            commentsEl.insertAdjacentHTML('beforeend', `
                <div class="bg-theme-auto p-3 mb-3 rounded-4 shadow-sm" data-id="${item.id}">
                    <strong>${util.escapeHtml(item.name)}</strong>
                    <p class="mt-2 mb-1">${util.escapeHtml(item.comment)}</p>
                    <small class="text-muted">${item.time}</small>

                    <div class="mt-2 d-flex gap-2">
                        <button class="btn btn-sm btn-outline-secondary"
                            onclick="undangan.comment.edit('${item.id}')">
                            Edit
                        </button>

                        ${IS_ADMIN ? `
                        <button class="btn btn-sm btn-outline-primary"
                            onclick="undangan.comment.reply('${item.id}')">
                            Reply
                        </button>` : ''}
                    </div>

                    ${item.reply ? `
                        <div class="mt-3 ms-3 p-2 rounded-3 bg-light border">
                            <strong>Admin</strong>
                            <p class="mb-1">${util.escapeHtml(item.reply.text)}</p>
                            <small class="text-muted">${item.reply.time}</small>
                        </div>
                    ` : ''}
                </div>
            `);
        });
    };

    /* ===============================
     * SHOW
     * =============================== */
    const show = async () => {
        commentsEl.setAttribute('data-loading', 'false');
        render(getLocalComments());
        return Promise.resolve();
    };

    /* ===============================
     * SEND
     * =============================== */
    const send = async () => {
        const nameInput = document.getElementById('form-name');
        const commentInput = document.getElementById('form-comment');

        if (!nameInput?.value.trim()) {
            util.notify('Name cannot be empty').warning();
            return;
        }

        if (!commentInput?.value.trim()) {
            util.notify('Comment cannot be empty').warning();
            return;
        }

        const data = getLocalComments();

        data.push({
            id: crypto.randomUUID(),
            name: util.escapeHtml(nameInput.value.trim()),
            comment: util.escapeHtml(commentInput.value.trim()),
            time: new Date().toLocaleString('id-ID'),
            reply: null
        });

         saveLocalComments(data);
        storage('information').unset('name'); // hapus nama dari localStorage
        commentInput.value = '';
        nameInput.value = '';
        render(data);

    };

    /* ===============================
     * EDIT (GUEST)
     * =============================== */
    const edit = (id) => {
        const data = getLocalComments();
        const item = data.find(i => i.id === id);
        if (!item) return;

        const updated = prompt('Edit komentar:', item.comment);
        if (!updated || !updated.trim()) return;

        item.comment = util.escapeHtml(updated.trim());
        saveLocalComments(data);
        render(data);
    };

    /* ===============================
     * REPLY (ADMIN)
     * =============================== */
    const reply = (id) => {
        if (!IS_ADMIN) return;

        const data = getLocalComments();
        const item = data.find(i => i.id === id);
        if (!item) return;

        const text = prompt('Balasan admin:');
        if (!text || !text.trim()) return;

        item.reply = {
            text: util.escapeHtml(text.trim()),
            time: new Date().toLocaleString('id-ID')
        };

        saveLocalComments(data);
        render(data);
    };

    /* ===============================
     * INIT
     * =============================== */
    const init = () => {
        gif?.init?.();
        like?.init?.();
        card?.init?.();
        pagination?.init?.();

        commentsEl = document.getElementById('comments');
        if (!commentsEl) return;

        commentsEl.addEventListener('undangan.comment.show', show);
    };

    return {
        init,
        show,
        send,
        edit,
        reply,
    };
})();
