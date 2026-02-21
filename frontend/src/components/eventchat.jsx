import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axiosmiddleware';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EventChat = ({ eventId, isOrganizer }) => {
    const user = JSON.parse(localStorage.getItem('userData'));
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [replyTo, setReplyTo] = useState(null); // { id, content }

    const socketRef = useRef(null);
    const fetchMessages = async () => {
        try {
            const res = await api.get(`/api/messages/getMessages/${eventId}`);
            setMessages(res.data.messages);
        } catch (e) {
            console.error('Error fetching messages', e);
        }
    };

    useEffect(() => {
        fetchMessages();

        const socket = io(BACKEND_URL, { withCredentials: true });
        socketRef.current = socket;
        socket.emit('join_event', eventId);

        socket.on('new_message', (msg) => {
            setMessages(prev => [...prev, msg]);
            const senderId = msg.userId?._id || msg.userId;
            if (senderId !== user._id) {
                const name = msg.userId?.organizername || (msg.userId?.firstName + ' ' + msg.userId?.lastName) || 'Someone';
                alert(`New message from ${name}:\n${msg.messageContent}`);
            }
        });

        socket.on('message_pinned', ({ messageId, pinned }) => {
            setMessages(prev =>
                prev.map(m => m._id === messageId ? { ...m, pinned } : m)
            );
        });

        socket.on('message_deleted', ({ messageId }) => {
            setMessages(prev =>
                prev.filter(m => m._id !== messageId && m.parentMessageId !== messageId)
            );
        });

        socket.on('message_reacted', ({ messageId, likes, dislikes }) => {
            setMessages(prev =>
                prev.map(m => m._id === messageId ? { ...m, likes, dislikes } : m)
            );
        });

        return () => socket.disconnect();
    }, [eventId]);

    const sendMessage = async () => {
        if (!text.trim()) return;
        try {
            const res = await api.post('/api/messages/createMessage', {
                eventId,
                messageContent: text,
                parentMessageId: replyTo ? replyTo.id : undefined,
            });
            const displayName = user.organizername || (user.firstName + ' ' + user.lastName);
            const newMsg = {
                ...res.data.message,
                userId: { name: displayName, organizername: user.organizername, firstName: user.firstName, lastName: user.lastName },
            };
            setMessages(prev => [...prev, newMsg]);
            socketRef.current.emit('new_message', { ...newMsg, eventId });
            setText('');
            setReplyTo(null);
        } catch (e) {
            alert('Error sending message: ' + (e.response?.data?.message || e.message));
        }
    };

    const pinMessage = async (messageId, currentPinned) => {
        try {
            await api.post('/api/messages/pinMessage', { messageId });
            const newPinned = !currentPinned;
            setMessages(prev =>
                prev.map(m => m._id === messageId ? { ...m, pinned: newPinned } : m)
            );
            socketRef.current.emit('message_pinned', { eventId, messageId, pinned: newPinned });
        } catch (e) {
            alert('Error pinning message');
        }
    };

    const deleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await api.post('/api/messages/deleteMessage', { messageId });
            setMessages(prev =>
                prev.filter(m => m._id !== messageId && m.parentMessageId !== messageId)
            );
            socketRef.current.emit('message_deleted', { eventId, messageId });
        } catch (e) {
            alert('Error deleting message');
        }
    };

    const react = async (messageId, type) => {
        try {
            const endpoint = type === 'like' ? '/api/messages/likeMessage' : '/api/messages/dislikeMessage';
            const res = await api.post(endpoint, { messageId });
            const { likes, dislikes } = res.data.message;
            setMessages(prev =>
                prev.map(m => m._id === messageId ? { ...m, likes, dislikes } : m)
            );
            socketRef.current.emit('message_reacted', { eventId, messageId, likes, dislikes });
        } catch (e) {
            alert('Error reacting to message');
        }
    };

    // ── render ───────────────────────────────────────────────────────────────
    const pinned = messages.filter(m => m.pinned);
    const topLevel = messages.filter(m => !m.parentMessageId);
    const getReplies = (id) => messages.filter(m => m.parentMessageId === id);

    const renderMessage = (msg, isReply = false) => (
        <div key={msg._id} style={{ marginLeft: isReply ? '20px' : '0', borderLeft: isReply ? '2px solid #ccc' : 'none', paddingLeft: isReply ? '8px' : '0' }}>
            <p>
                <strong>{msg.userId?.organizername || (msg.userId?.firstName + ' ' + msg.userId?.lastName) || 'User'}</strong>
                {msg.pinned && <span> 📌</span>}
                {' — '}{msg.messageContent}
            </p>
            <span>👍 {msg.likes || 0}</span>{' '}
            <button onClick={() => react(msg._id, 'like')}>Like</button>{' '}
            <button onClick={() => react(msg._id, 'dislike')}>Dislike</button>{' '}
            <button onClick={() => setReplyTo({ id: msg._id, content: msg.messageContent })}>Reply</button>{' '}
            {isOrganizer && (
                <>
                    <button onClick={() => pinMessage(msg._id, msg.pinned)}>{msg.pinned ? 'Unpin' : 'Pin'}</button>{' '}
                    <button onClick={() => deleteMessage(msg._id)}>Delete</button>
                </>
            )}
            {getReplies(msg._id).map(r => renderMessage(r, true))}
        </div>
    );

    return (
        <div>
            <h2>Event Forum</h2>



            {pinned.length > 0 && (
                <div>
                    <h3>📌 Pinned</h3>
                    {pinned.map(m => renderMessage(m))}
                </div>
            )}

            <div>
                {topLevel.length === 0 ? (
                    <p>No messages yet. Be the first!</p>
                ) : (
                    topLevel.map(m => renderMessage(m))
                )}
            </div>

            <div>
                {replyTo && (
                    <p>
                        Replying to: <em>{replyTo.content.slice(0, 50)}</em>{' '}
                        <button onClick={() => setReplyTo(null)}>Cancel</button>
                    </p>
                )}
                <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder={replyTo ? 'Write a reply...' : 'Write a message...'}
                    style={{ width: '60%' }}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default EventChat;