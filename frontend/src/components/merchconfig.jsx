import React from 'react'

const MerchandiseConfig = ({currmerchconfig, setMerchconfig, disabled = false, eventStatus = 'draft'}) => {
    
    const updateField = (field, value) => {
        if (!disabled) {
            setMerchconfig({...currmerchconfig, [field]: value})
        }
    }
    
    const isFieldLocked = (fieldName) => {
        if (disabled) return true; 
        if (eventStatus === 'draft') return false; // All fields editable in draft
        if (eventStatus === 'published') {
            return fieldName !== 'stock';
        }
        return true;
    };
    
    // Calculate stock information for published events
    const totalStock = currmerchconfig.stock || 0;
    const itemsRemaining = currmerchconfig.itemsRemaining || 0;
    const itemsSold = totalStock - itemsRemaining;
    const showStockInfo = eventStatus === 'published' && totalStock > 0;
    
    return(
            <div>
                <h3>Merchandise Configuration</h3>
                <label>Item Name</label>
                <input placeholder="Item Name" type='text' value={currmerchconfig.itemName || ''} onChange={(e) => updateField('itemName', e.target.value)} disabled={isFieldLocked('itemName')}></input>
                <br/>
                <label>Price</label>
                <input placeholder="Price" type='number' value={currmerchconfig.price || ''} onChange={(e) => updateField('price', e.target.value)} disabled={isFieldLocked('price')}></input>
                <br/>
                <label>Variants (comma separated)</label>
                <input placeholder="e.g., Small, Medium, Large, XL" type='text' value={currmerchconfig.variants || ''} onChange={(e) => updateField('variants', e.target.value)} disabled={isFieldLocked('variants')}></input>
                <br/>
                <label>Stock</label>
                <input placeholder="Stock" type="number" value={currmerchconfig.stock || ''} onChange={(e) => updateField('stock', e.target.value)} disabled={isFieldLocked('stock')}></input>
                {showStockInfo && (
                    <div style={{fontSize: '14px', color: '#666', marginTop: '5px'}}>
                        <p>Items Sold: {itemsSold} | Items Remaining: {itemsRemaining}</p>
                        {itemsSold > 0 && <p><em>Note: Stock cannot be reduced below {itemsSold} (already sold)</em></p>}
                    </div>
                )}
                <br/>
                <label>Purchase Limit per person</label>
                <input placeholder='Purchase Limit per person' type="number" value={currmerchconfig.purchaseLimit || ''} onChange={(e) => updateField('purchaseLimit', e.target.value)} disabled={isFieldLocked('purchaseLimit')}></input>
                <br/>
            </div>
        )
}

export default MerchandiseConfig