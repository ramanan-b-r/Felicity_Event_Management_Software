import React from 'react'

const MerchandiseConfig = ({currmerchconfig, setMerchconfig}) => {
    
    const updateField = (field, value) => {
        setMerchconfig({...currmerchconfig, [field]: value})
    }
    
    return(
            <div>
                <h3>Merchandise Configuration</h3>
                <label>Item Name</label>
                <input placeholder="Item Name" type='text' value={currmerchconfig.itemName || ''} onChange={(e) => updateField('itemName', e.target.value)}></input>
                <br/>
                <label>Price</label>
                <input placeholder="Price" type='number' value={currmerchconfig.price || ''} onChange={(e) => updateField('price', e.target.value)}></input>
                <br/>
                <label>Variants (comma separated)</label>
                <input placeholder="e.g., Small, Medium, Large, XL" type='text' value={currmerchconfig.variants || ''} onChange={(e) => updateField('variants', e.target.value)}></input>
                <br/>
                <label>Stock</label>
                <input placeholder="Stock" type="number" value={currmerchconfig.stock || ''} onChange={(e) => updateField('stock', e.target.value)}></input>
                <br/>
                <label>Purchase Limit per person</label>
                <input placeholder='Purchase Limit per person' type="number" value={currmerchconfig.purchaseLimit || ''} onChange={(e) => updateField('purchaseLimit', e.target.value)}></input>
                <br/>
            </div>
        )
}

export default MerchandiseConfig