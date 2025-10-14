import React, {ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import styles from '../../Css/Modal.module.css';
import {useDarkMode} from "../DarkModeProvider";

interface ModalProps {
    isOpen: boolean,
    onClose: () => void,
    children: ReactNode,
    title?: string,
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full',
    className?: string,
    closeOnBackdropClick?: boolean,
    showCloseButton?: boolean,
    resizable?: boolean,
    pannable?: boolean,
    initialWidth?: number,
    initialHeight?: number,
    showBackButton?: boolean, // This is already correctly added
    onBack?: () => void,     // This is already correctly added
    animationType?: 'fadeIn' | 'slideInUp';
}

interface ModalState {
    width: number;
    height: number;
    x: number;
    y: number;
    isDragging: boolean;
    isResizing: boolean;
    dragStart: { x: number; y: number };
    resizeStart: { x: number; y: number; width: number; height: number };
    resizeDirection: string;
}

const Modal: React.FC<ModalProps> = ({
                                         isOpen,
                                         onClose,
                                         children,
                                         title,
                                         size = 'md',
                                         className = '',
                                         closeOnBackdropClick = true,
                                         showCloseButton = true,
                                         resizable = true,
                                         pannable = false,
                                         initialWidth,
                                         initialHeight,
                                         showBackButton, // Destructure the prop
                                         onBack,          // Destructure the prop
                                         animationType = 'fadeIn'
                                     }) => {
    // @ts-ignore
    const {isDarkMode} = useDarkMode();
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);

    // Pan state for content
    const [panState, setPanState] = useState({
        x: 0,
        y: 0,
        isDragging: false,
        startX: 0,
        startY: 0,
        startPanX: 0,
        startPanY: 0
    });

    // Modal state for position and size
    const [modalState, setModalState] = useState<ModalState>({
        width: initialWidth || getSizeWidth(size),
        height: initialHeight || getSizeHeight(size),
        x: 0,
        y: 0,
        isDragging: false,
        isResizing: false,
        dragStart: {x: 0, y: 0},
        resizeStart: {x: 0, y: 0, width: 0, height: 0},
        resizeDirection: ''
    });

    function getSizeWidth(size: string): number {
        switch (size) {
            case 'sm':
                return 400;
            case 'md':
                return 600;
            case 'lg':
                return 800;
            case 'xl':
                return 1200;
            case 'full':
                return Math.min(window.innerWidth * 0.95, 1400);
            default:
                return 600;
        }
    }

    function getSizeHeight(size: string): number {
        switch (size) {
            case 'sm':
                return 300;
            case 'md':
                return 500;
            case 'lg':
                return 700;
            case 'xl':
                return 800;
            case 'full':
                return Math.min(window.innerHeight * 0.95, 900);
            default:
                return 500;
        }
    }

    // Center modal on open and ensure it fits within viewport
    useEffect(() => {
        if (isOpen) {
            const maxWidth = window.innerWidth - 40; // 20px padding on each side
            const maxHeight = window.innerHeight - 40; // 20px padding on each side

            const width = Math.min(modalState.width, maxWidth);
            const height = Math.min(modalState.height, maxHeight);

            const centerX = Math.max(20, (window.innerWidth - width) / 2);
            const centerY = Math.max(20, (window.innerHeight - height) / 2);

            setModalState(prev => ({
                ...prev,
                x: centerX,
                y: centerY,
                width,
                height
            }));
            setPanState(prev => ({...prev, x: 0, y: 0}));
        }
    }, [isOpen]);

    const handleEscapeKey = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen) {
            onClose();
        }
    }, [isOpen, onClose]);

    const handleBackdropClick = useCallback((event: React.MouseEvent) => {
        if (closeOnBackdropClick && event.target === event.currentTarget) {
            onClose();
        }
    }, [closeOnBackdropClick, onClose]);

    // Modal dragging
    const handleModalDragStart = useCallback((event: React.MouseEvent) => {
        if (!title) return;

        const target = event.target as HTMLElement;
        // Allow dragging only if the target is NOT a button (this includes the back/close buttons)
        if (target.tagName === 'BUTTON') return;

        event.preventDefault();
        setModalState(prev => ({
            ...prev,
            isDragging: true,
            dragStart: {x: event.clientX - prev.x, y: event.clientY - prev.y}
        }));
    }, [title]);

    const handleModalDragMove = useCallback((event: MouseEvent) => {
        if (!modalState.isDragging) return;

        const newX = event.clientX - modalState.dragStart.x;
        const newY = event.clientY - modalState.dragStart.y;

        // Boundary constraints
        const maxX = window.innerWidth - modalState.width - 20;
        const maxY = window.innerHeight - modalState.height - 20;

        setModalState(prev => ({
            ...prev,
            x: Math.max(20, Math.min(newX, maxX)),
            y: Math.max(20, Math.min(newY, maxY))
        }));
    }, [modalState.isDragging, modalState.dragStart.x, modalState.dragStart.y, modalState.width, modalState.height]);

    const handleModalDragEnd = useCallback(() => {
        setModalState(prev => ({...prev, isDragging: false}));
    }, []);

    // Modal resizing
    const handleResizeStart = useCallback((event: React.MouseEvent, direction: string) => {
        event.preventDefault();
        event.stopPropagation();

        setModalState(prev => ({
            ...prev,
            isResizing: true,
            resizeDirection: direction,
            resizeStart: {
                x: event.clientX,
                y: event.clientY,
                width: prev.width,
                height: prev.height
            }
        }));
    }, []);

    const handleResizeMove = useCallback((event: MouseEvent) => {
        if (!modalState.isResizing) return;

        const deltaX = event.clientX - modalState.resizeStart.x;
        const deltaY = event.clientY - modalState.resizeStart.y;

        let newWidth = modalState.resizeStart.width;
        let newHeight = modalState.resizeStart.height;

        if (modalState.resizeDirection.includes('right')) {
            newWidth = Math.max(300, modalState.resizeStart.width + deltaX);
        }
        if (modalState.resizeDirection.includes('bottom')) {
            newHeight = Math.max(200, modalState.resizeStart.height + deltaY);
        }

        // Boundary constraints
        const maxWidth = window.innerWidth - modalState.x - 20;
        const maxHeight = window.innerHeight - modalState.y - 20;

        setModalState(prev => ({
            ...prev,
            width: Math.min(newWidth, maxWidth),
            height: Math.min(newHeight, maxHeight)
        }));
    }, [modalState.isResizing, modalState.resizeStart, modalState.resizeDirection, modalState.x, modalState.y]);

    const handleResizeEnd = useCallback(() => {
        setModalState(prev => ({...prev, isResizing: false, resizeDirection: ''}));
    }, []);

    // Pan functionality for content
    const handlePanStart = useCallback((event: React.MouseEvent) => {
        if (!pannable) return;

        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.tagName === 'BUTTON') {
            return;
        }

        event.preventDefault();
        setPanState(prev => ({
            ...prev,
            isDragging: true,
            startX: event.clientX,
            startY: event.clientY,
            startPanX: prev.x,
            startPanY: prev.y
        }));
    }, [pannable]);

    const handlePanMove = useCallback((event: MouseEvent) => {
        if (!panState.isDragging) return;

        const deltaX = event.clientX - panState.startX;
        const deltaY = event.clientY - panState.startY;

        const newX = panState.startPanX + deltaX;
        const newY = panState.startPanY + deltaY;

        setPanState(prev => ({
            ...prev,
            x: newX,
            y: newY
        }));
    }, [panState.isDragging, panState.startX, panState.startY, panState.startPanX, panState.startPanY]);

    const handlePanEnd = useCallback(() => {
        setPanState(prev => ({...prev, isDragging: false}));
    }, []);

    // Global mouse events
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            handleModalDragMove(event);
            handleResizeMove(event);
            handlePanMove(event);
        };

        const handleMouseUp = () => {
            handleModalDragEnd();
            handleResizeEnd();
            handlePanEnd();
        };

        if (modalState.isDragging || modalState.isResizing || panState.isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
        };
    }, [modalState.isDragging, modalState.isResizing, panState.isDragging, handleModalDragMove, handleResizeMove, handlePanMove, handleModalDragEnd, handleResizeEnd, handlePanEnd]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            previouslyFocusedElement.current = document.activeElement as HTMLElement;
            document.body.style.overflow = 'hidden';

            setTimeout(() => modalRef.current?.focus(), 100);
        } else {
            document.body.style.overflow = '';
            previouslyFocusedElement.current?.focus();
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscapeKey]);

    useEffect(() => {
        if (!isOpen) return;

        const handleTabKey = (event: KeyboardEvent) => {
            if (event.key !== 'Tab' || !modalRef.current) return;

            const focusableElements = modalRef.current.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );

            const firstEl = focusableElements[0] as HTMLElement;
            const lastEl = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (focusableElements.length === 0) return;

            if (event.shiftKey) {
                if (document.activeElement === firstEl) {
                    lastEl?.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastEl) {
                    firstEl?.focus();
                    event.preventDefault();
                }
            }
        };

        document.addEventListener('keydown', handleTabKey);
        return () => document.removeEventListener('keydown', handleTabKey);
    }, [isOpen]);

    const backdropClasses = `${styles.modalBackdrop} ${isDarkMode ? styles.dark : ''}`;
    const modalClasses = `${styles.modalContent} ${isDarkMode ? styles.darkMode : ''} ${className} ${styles[animationType] || ''}`;

    const panTransform = `translate(${panState.x}px, ${panState.y}px)`;
    const handleBackClick = useCallback(() => {
        if (onBack) {
            onBack();
        }
    }, [onBack]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className={backdropClasses}
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <div
                className={styles.rndContainer}
                style={{
                    position: 'absolute',
                    left: modalState.x,
                    top: modalState.y,
                    width: modalState.width,
                    height: modalState.height,
                    zIndex: 1000
                }}
            >
                <div
                    className={modalClasses}
                    ref={modalRef}
                    tabIndex={-1}
                    role="document"
                    onClick={(e) => e.stopPropagation()}
                >
                    {title && (
                        <header
                            className={`${styles.modalHeader} ${styles.draggableHeader}`}
                            onMouseDown={handleModalDragStart}
                            style={{cursor: modalState.isDragging ? 'grabbing' : 'grab'}}
                        >
                            {/* --- ADD BACK BUTTON HERE --- */}
                            {showBackButton && onBack && (
                                <button
                                    className={styles.backButton} // You'll need to define this style in your CSS
                                    onClick={handleBackClick}
                                    aria-label="Back"
                                    type="button"
                                >
                                    ←
                                </button>
                            )}
                            <h3 id="modal-title" className={styles.modalTitle}>{title}</h3>
                            {showCloseButton && (
                                <button
                                    className={styles.closeBtn}
                                    onClick={onClose}
                                    aria-label="Close modal"
                                    type="button"
                                >
                                    ×
                                </button>
                            )}
                        </header>
                    )}

                    {/* If there's no title but a close button, you might need to decide where the back button goes */}
                    {/* For simplicity, if there's no title, assume no back button for now, or add another conditional block */}
                    {!title && showCloseButton && (
                        <button
                            className={styles.closeBtnNoTitle}
                            onClick={onClose}
                            aria-label="Close modal"
                            type="button"
                        >
                            ×
                        </button>
                    )}

                    <main
                        className={`${styles.modalBody} ${isDarkMode ? styles.darkMode : ''} ${pannable ? styles.pannable : ''}`}
                        onMouseDown={handlePanStart}
                        style={{
                            cursor: pannable ? (panState.isDragging ? 'grabbing' : 'grab') : 'default'
                        }}
                    >
                        <div
                            ref={contentRef}
                            className={styles.modalContentWrapper}
                            style={{
                                transform: panState.x !== 0 || panState.y !== 0 ? panTransform : undefined,
                                transition: panState.isDragging ? 'none' : 'transform 0.2s ease-out'
                            }}
                        >
                            {children}
                        </div>
                    </main>

                    {/* Resize handles */}
                    {resizable && (
                        <>
                            <div
                                className={styles.resizeHandle}
                                style={{
                                    right: -5,
                                    top: 0,
                                    width: 10,
                                    height: '100%',
                                    cursor: 'e-resize'
                                }}
                                onMouseDown={(e) => handleResizeStart(e, 'right')}
                            />
                            <div
                                className={styles.resizeHandle}
                                style={{
                                    bottom: -5,
                                    left: 0,
                                    width: '100%',
                                    height: 10,
                                    cursor: 's-resize'
                                }}
                                onMouseDown={(e) => handleResizeStart(e, 'bottom')}
                            />
                            <div
                                className={styles.resizeHandleCorner}
                                onMouseDown={(e) => handleResizeStart(e, 'bottom right')}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;