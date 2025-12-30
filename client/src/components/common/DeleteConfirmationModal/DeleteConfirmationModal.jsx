// client/src/components/common/DeleteConfirmationModal/DeleteConfirmationModal.jsx
import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  isDeleting = false
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleEnter = (e) => {
      if (e.key === 'Enter' && isOpen && !isDeleting) {
        e.preventDefault();
        onConfirm();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleEnter);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleEnter);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onConfirm, isDeleting]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="delete-modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="delete-modal">
        <button
          className="delete-modal-close"
          onClick={onClose}
          aria-label="Close modal"
          disabled={isDeleting}
        >
          <X size={20} />
        </button>

        <div className="delete-modal-icon">
          <AlertTriangle size={48} />
        </div>

        <div className="delete-modal-content">
          <h2 id="delete-modal-title">Delete {itemType}?</h2>
          <p>
            Are you sure you want to delete <strong>"{itemName}"</strong>?
          </p>
          <p className="delete-modal-warning">
            This action cannot be undone.
          </p>
        </div>

        <div className="delete-modal-actions">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={isDeleting}
            autoFocus
          >
            Cancel
          </button>
          <button
            className="btn-delete"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="delete-spinner"></span>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
