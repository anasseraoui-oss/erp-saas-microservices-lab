// Fixed SearchResultsModal component with proper dark mode implementation
import * as React from 'react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import styles from '../../../Css/search/SearchResultsModal.module.css';
import DetailRenderer, { getDetailTitle } from './DetailRenderer';
import Modal from '../../basec/Modal';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {updateOrderStatus} from "../../../api/OrderInvoiceService";
import {useDarkMode} from "../../DarkModeProvider";

// Type definitions
interface FullSearchResults {
  salesInvoice: any[];
  purchasesInvoice: any[];
  salesOrder: any[];
  purchasesOrder: any[];
  products: any[];
  supplierClients: any[];
  UsersToRoles: any[];
  salesLines: any[];
  purchasesLines: any[];
  salesLineReturns: any[];
  purchasesLineReturns: any[];
}

interface SearchResultsModalProps {
  searchResults: FullSearchResults | null;
  onClose: () => void;
  onEditProduct?: (product: any) => void;
  onDeleteProduct?: (productId: number) => void;
  onViewProductDetails?: (product: any) => void;
  onUpdateUser?: (user: any) => void;
  onShowNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

// Define filter types properly
type FilterKey = 'all' | 'invoices' | 'orders' | 'products' | 'partners' | 'users' | 'lines' | 'returns';

interface FilterWithGroups {
  key: FilterKey;
  label: string;
  groups: readonly (keyof FullSearchResults)[];
}

interface FilterWithoutGroups {
  key: 'all';
  label: string;
}

type FilterType = FilterWithGroups | FilterWithoutGroups;

// Constants with proper typing
const FILTERS: readonly FilterType[] = [
  { key: 'all', label: 'All' },
  { key: 'invoices', label: 'Invoices', groups: ['salesInvoice', 'purchasesInvoice'] },
  { key: 'orders', label: 'Orders', groups: ['salesOrder', 'purchasesOrder'] },
  { key: 'products', label: 'Products', groups: ['products'] },
  { key: 'partners', label: 'Partners', groups: ['supplierClients'] },
  { key: 'users', label: 'Users', groups: ['UsersToRoles'] },
  { key: 'lines', label: 'Document Lines', groups: ['salesLines', 'purchasesLines'] },
  { key: 'returns', label: 'Return Lines', groups: ['salesLineReturns', 'purchasesLineReturns'] },
] as const;

const GROUP_LABELS: Record<keyof FullSearchResults, string> = {
  products: 'Products',
  supplierClients: 'Suppliers / Clients',
  UsersToRoles: 'Users',
  salesInvoice: 'Sales Invoices',
  purchasesInvoice: 'Purchase Invoices',
  salesOrder: 'Sales Orders',
  purchasesOrder: 'Purchase Orders',
  salesLines: 'Sales Lines',
  purchasesLines: 'Purchase Lines',
  salesLineReturns: 'Sales Return Lines',
  purchasesLineReturns: 'Purchase Return Lines',
};

// Memoized draggable group component for better performance
interface DraggableGroupProps {
  groupKey: keyof FullSearchResults;
  children: React.ReactNode;
  isDarkMode: boolean;
}

const DraggableGroup = React.memo<DraggableGroupProps>(
    ({ groupKey, children, isDarkMode }) => {
      const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
      } = useSortable({ id: groupKey });

      const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 10 : 'auto'
      };

      return (
          <div
              ref={setNodeRef}
              style={style}
              className={`${styles.draggableGroup} ${isDarkMode ? styles.dark : ''}`}
          >
            <h6
                className={`${styles.resultsGroupTitle} ${isDarkMode ? styles.dark : ''}`}
                {...attributes}
                {...listeners}
            >
              <span className={styles.dragHandle} aria-hidden="true">⠿</span>
              {GROUP_LABELS[groupKey]}
            </h6>
            <div className={`${styles.groupContent} ${isDarkMode ? styles.dark : ''}`}>
              {children}
            </div>
          </div>
      );
    }
);

DraggableGroup.displayName = 'DraggableGroup';

// Type guard to check if filter has groups
const hasGroups = (filter: FilterType): filter is FilterWithGroups => {
  return 'groups' in filter;
};

const SearchResultsModal: React.FC<SearchResultsModalProps> = ({
                                                                 searchResults,
                                                                 onClose,
                                                                 onEditProduct,
                                                                 onDeleteProduct,
                                                                 onViewProductDetails,
                                                                 onUpdateUser,
                                                                 onShowNotification
                                                               }) => {
  // Fixed dark mode implementation
  // @ts-ignore
  const { isDarkMode } = useDarkMode();

  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<keyof FullSearchResults | null>(null);
  const [animating, setAnimating] = useState(false);
  const [groupOrder, setGroupOrder] = useState<(keyof FullSearchResults)[]>([]);

  // Notification helper with fallback
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    if (onShowNotification) {
      onShowNotification(message, type);
    } else {
      // Fallback to console or alert based on type
      if (type === 'error') {
        console.error(message);
      } else {
        console.log(message);
      }
    }
  }, [onShowNotification]);

  // Handle order status updates with proper error handling and notifications
  const handleUpdateOrderStatus = useCallback(async (
      orderId: number,
      status: string,
      serviceType: string
  ): Promise<void> => {
    if (!orderId || !status || !serviceType) {
      showNotification('Invalid order update parameters', 'error');
      return;
    }

    try {
      await updateOrderStatus(orderId, status, serviceType);

      // Show success notification
      const message = `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Order #${orderId} status updated to ${status}`;
      showNotification(message, 'success');

      // Update the selected item's status if it's currently selected
      if (selectedItem && selectedItem.id === orderId) {
        setSelectedItem((prev: any) => ({ ...prev, status }));
      }

    } catch (error) {
      console.error("Failed to update order status:", error);
      const errorMessage = `Failed to update order status. Please try again.`;
      showNotification(errorMessage, 'error');
      throw error; // Re-throw for DetailRenderer to handle
    }
  }, [selectedItem, showNotification]);

  // Handle product actions with proper callbacks and error handling
  const handleEditProduct = useCallback((product: any) => {
    if (onEditProduct && product) {
      try {
        onEditProduct(product);
        showNotification(`Editing product: ${product.name || 'Unnamed Product'}`, 'info');
      } catch (error) {
        console.error('Error editing product:', error);
        showNotification('Failed to edit product', 'error');
      }
    }
  }, [onEditProduct, showNotification]);

  const handleDeleteProduct = useCallback((productId: number) => {
    if (onDeleteProduct && productId) {
      try {
        onDeleteProduct(productId);
        showNotification('Product deleted successfully', 'success');
        backToList();
      } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Failed to delete product', 'error');
      }
    }
  }, [onDeleteProduct, showNotification]);

  const handleViewProductDetails = useCallback((product: any) => {
    if (onViewProductDetails && product) {
      try {
        onViewProductDetails(product);
        showNotification(`Viewing details for: ${product.name || 'Unnamed Product'}`, 'info');
      } catch (error) {
        console.error('Error viewing product details:', error);
        showNotification('Failed to view product details', 'error');
      }
    }
  }, [onViewProductDetails, showNotification]);

  const handleUpdateUser = useCallback((user: any) => {
    if (onUpdateUser && user) {
      try {
        onUpdateUser(user);
        showNotification(`User updated: ${user.fullName || user.email || 'Unknown User'}`, 'success');

        // Update the selected item if it's currently selected
        if (selectedItem && selectedItem.id === user.id) {
          setSelectedItem((prev: any) => ({ ...prev, ...user }));
        }
      } catch (error) {
        console.error('Error updating user:', error);
        showNotification('Failed to update user', 'error');
      }
    }
  }, [onUpdateUser, selectedItem, showNotification]);

  // Memoized available filters for better performance
  const availableFilters = useMemo(() => {
    if (!searchResults) return [FILTERS[0]];
    return FILTERS.filter(filter =>
        filter.key === 'all' ||
        (hasGroups(filter) && filter.groups.some((group: keyof FullSearchResults) =>
            searchResults[group]?.length > 0
        ))
    );
  }, [searchResults]);

  // Memoized filtered groups
  const filteredGroups = useMemo((): (keyof FullSearchResults)[] => {
    if (!searchResults) return [];
    if (activeFilter === 'all') {
      return (Object.keys(GROUP_LABELS) as (keyof FullSearchResults)[]).filter((group: keyof FullSearchResults) =>
          searchResults[group]?.length > 0
      );
    }
    const filter = FILTERS.find(f => f.key === activeFilter);
    if (!filter || !hasGroups(filter)) return [];
    return filter.groups.filter((group: keyof FullSearchResults) =>
        searchResults[group]?.length > 0
    );
  }, [searchResults, activeFilter]);

  // Update group order when filtered groups change
  useEffect(() => {
    setGroupOrder(filteredGroups);
  }, [filteredGroups]);

  // Calculate result counts for better UX
  const resultCounts = useMemo(() => {
    if (!searchResults) return {} as Record<keyof FullSearchResults, number>;
    const counts: Record<keyof FullSearchResults, number> = {} as Record<keyof FullSearchResults, number>;
    (Object.entries(searchResults) as [keyof FullSearchResults, any[]][]).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        counts[key] = value.length;
      }
    });
    return counts;
  }, [searchResults]);

  const totalResults = useMemo(() =>
          (Object.values(resultCounts) as number[]).reduce((sum: number, count: number) => sum + count, 0),
      [resultCounts]
  );

  const noResults = !searchResults || groupOrder.length === 0;

  // Optimized sensors configuration
  const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates
      })
  );

  // Optimized drag end handler
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setGroupOrder((items: (keyof FullSearchResults)[]) => {
        const oldIndex = items.indexOf(active.id as keyof FullSearchResults);
        const newIndex = items.indexOf(over.id as keyof FullSearchResults);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  // Optimized animation handlers
  const showDetails = useCallback((item: any, type: keyof FullSearchResults) => {
    if (animating) return;

    setAnimating(true);
    setTimeout(() => {
      setSelectedItem(item);
      setSelectedType(type);
      setViewMode('details');
      setAnimating(false);
    }, 180);
  }, [animating]);

  const backToList = useCallback(() => {
    if (animating) return;

    setAnimating(true);
    setTimeout(() => {
      setViewMode('list');
      setSelectedItem(null);
      setSelectedType(null);
      setAnimating(false);
    }, 180);
  }, [animating]);

  // Improved item display text with better fallbacks
  const getItemDisplayText = useCallback((item: any, group: keyof FullSearchResults): string => {
    if (!item) return 'Unknown item';

    switch (group) {
      case 'products':
        return `${item.name || 'Unnamed Product'}${item.quantity ? ` (quantity: ${item.quantity})` : ''}`;
      case 'supplierClients':
        return `${item.name || 'Unnamed Partner'}${item.email ? ` - ${item.email}` : ''}`;
      case 'UsersToRoles':
        return `${item.fullName || item.email || 'Unknown User'}${item.role ? ` (${item.role})` : ''}`;
      case 'salesInvoice':
        return `Sales Invoice #${item.id}${item.customer ? ` - ${item.customer}` : ''}${item.total ? ` (${item.total.toFixed(2)})` : ''}`;
      case 'purchasesInvoice':
        return `Purchase Invoice #${item.id}${item.supplier ? ` - ${item.supplier}` : ''}${item.total ? ` (${item.total.toFixed(2)})` : ''}`;
      case 'salesOrder':
        return `Sales Order #${item.id}${item.customer ? ` - ${item.customer}` : ''}${item.status ? ` [${item.status}]` : ''}`;
      case 'purchasesOrder':
        return `Purchase Order #${item.id}${item.supplier ? ` - ${item.supplier}` : ''}${item.status ? ` [${item.status}]` : ''}`;
      case 'salesLines':
      case 'purchasesLines':
        return `Line #${item.id} - ${item.productId || 'Unknown Product'} (Qty: ${item.quantity || 0})${item.price ? ` @ ${item.price.toFixed(2)}` : ''}`;
      case 'salesLineReturns':
      case 'purchasesLineReturns':
        return `Return #${item.id}${item.returnReason ? ` - ${item.returnReason}` : ''}${item.returnDate ? ` (date: ${item.returnDate})` : ''}`;
      default:
        return `Item #${item.id || 'Unknown'}`;
    }
  }, []);

  // Render methods with performance optimizations
  const renderFilterButton = useCallback((tab: FilterType) => (
      <button
          key={tab.key}
          className={`${styles.filterTab} ${activeFilter === tab.key ? styles.activeFilterTab : ''} ${isDarkMode ? styles.dark : ''}`}
          onClick={() => setActiveFilter(tab.key)}
          type="button"
          aria-pressed={activeFilter === tab.key}
      >
        {tab.label}
        {hasGroups(tab) && (
            <span className={`${styles.filterCount} ${isDarkMode ? styles.dark : ''}`}>
              ({tab.groups.reduce((sum: number, group: keyof FullSearchResults) => sum + (resultCounts[group] || 0), 0)})
            </span>
        )}
      </button>
  ), [activeFilter, resultCounts, isDarkMode]);

  const renderResultItem = useCallback((item: any, group: keyof FullSearchResults, idx: number) => {
    const displayText = getItemDisplayText(item, group);

    return (
        <div
            key={`${String(group)}-${item?.id || idx}`}
            className={`${styles.resultItemClickable} ${isDarkMode ? styles.dark : ''}`}
            onClick={() => showDetails(item, group)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showDetails(item, group);
              }
            }}
            aria-label={`View details for ${displayText}`}
        >
          <p className={`${styles.itemText} ${isDarkMode ? styles.dark : ''}`}>{displayText}</p>
          <span className={`${styles.itemArrow} ${isDarkMode ? styles.dark : ''}`}>→</span>
        </div>
    );
  }, [getItemDisplayText, isDarkMode, showDetails]);

  const renderList = useCallback(() => (
      <>
        {!noResults && (
            <div className={`${styles.filterBar} ${isDarkMode ? styles.dark : ''}`}>
              <div className={`${styles.filtersContainer} ${isDarkMode ? styles.dark : ''}`}>
                {availableFilters.map(renderFilterButton)}
              </div>
              <div className={`${styles.resultsSummary} ${isDarkMode ? styles.dark : ''}`}>
                {totalResults} result{totalResults !== 1 ? 's' : ''}
              </div>
            </div>
        )}
        <div className={`${styles.scrollableResults} ${isDarkMode ? styles.dark : ''}`}>
          {noResults ? (
              <div className={`${styles.noResultsContainer} ${isDarkMode ? styles.dark : ''}`}>
                <p className={`${styles.noResults} ${isDarkMode ? styles.dark : ''}`}>No results found.</p>
                <p className={`${styles.noResultsHint} ${isDarkMode ? styles.dark : ''}`}>Try adjusting your search terms or filters.</p>
              </div>
          ) : (
              <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
              >
                <SortableContext items={groupOrder} strategy={verticalListSortingStrategy}>
                  {groupOrder.map(group => (
                      <DraggableGroup key={String(group)} groupKey={group} isDarkMode={isDarkMode}>
                        {searchResults![group].map((item: any, idx: number) =>
                            renderResultItem(item, group, idx)
                        )}
                      </DraggableGroup>
                  ))}
                </SortableContext>
              </DndContext>
          )}
        </div>
      </>
  ), [
    noResults,
    isDarkMode,
    availableFilters,
    totalResults,
    sensors,
    handleDragEnd,
    groupOrder,
    searchResults,
    renderFilterButton,
    renderResultItem
  ]);

  const renderDetails = useCallback(() => {
    if (!selectedItem || !selectedType) return null;

    return (
        <DetailRenderer
            selectedItem={selectedItem}
            selectedType={selectedType}
            isDarkMode={isDarkMode}
            onClose={onClose}
            onBack={backToList}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onViewProductDetails={handleViewProductDetails}
            onUpdateUser={handleUpdateUser}
        />
    );
  }, [
    selectedItem,
    selectedType,
    isDarkMode,
    onClose,
    backToList,
    handleUpdateOrderStatus,
    handleEditProduct,
    handleDeleteProduct,
    handleViewProductDetails,
    handleUpdateUser
  ]);

  const getModalTitle = useCallback(() => {
    if (viewMode === 'list') return 'Search Results';
    return getDetailTitle(selectedItem, selectedType || '');
  }, [viewMode, selectedItem, selectedType]);

  // Don't render if no search results
  if (!searchResults) return null;

  return (
      <Modal
          isOpen={true}
          onClose={onClose}
          title={getModalTitle()}
          size="lg"
          resizable={true}
          showBackButton={viewMode === 'details'}
          onBack={backToList}
          className={`${styles.searchModal} ${isDarkMode ? styles.dark : ''}`}
      >
        <div className={`${styles.modalContentContainer} ${isDarkMode ? styles.dark : ''}`}>
          <div className={`${styles.contentWrapper} ${animating ? styles.fadeOut : styles.fadeIn} ${isDarkMode ? styles.dark : ''}`}>
            {viewMode === 'list' ? renderList() : renderDetails()}
          </div>
        </div>
      </Modal>
  );
};

export default SearchResultsModal;