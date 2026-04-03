import React, { useState } from 'react';
import { PDFExport } from '@progress/kendo-react-pdf';
import Autocomplete from 'react-autocomplete';
import './styles.css'; // Assuming you have a styles.css for custom styles

const TDCommissionBill = () => {
    const [formData, setFormData] = useState({ name: '', amount: '' });
    const [pdfVisible, setPdfVisible] = useState(false);
    const [autocompleteValue, setAutocompleteValue] = useState('');
    const items = ['Item 1', 'Item 2', 'Item 3']; // Sample items for autocomplete

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        setPdfVisible(true);
    };

    const pdfFile = () => (
        <div>
            <h1>TD Commission Bill</h1>
            <p>Name: {formData.name}</p>
            <p>Amount: {formData.amount}</p>
        </div>
    );

    return (
        <div className="td-commission-bill">
            <form onSubmit={handleSubmit}>
                <h2>TD Commission Bill Form</h2>
                <label>
                    Name:
                    <input type="text" name="name" onChange={handleChange} required />
                </label>
                <label>
                    Amount:
                    <input type="number" name="amount" onChange={handleChange} required />
                </label>
                <label>
                    Autocomplete:
                    <Autocomplete
                        items={items}
                        getItemValue={(item) => item}
                        renderItem={(item, isHighlighted) => (
                            <div key={item} style={{ background: isHighlighted ? '#eee' : '#fff' }}>
                                {item}
                            </div>
                        )}
                        value={autocompleteValue}
                        onChange={(e) => setAutocompleteValue(e.target.value)}
                        onSelect={(val) => setAutocompleteValue(val)}
                    />
                </label>
                <button type="submit">Generate PDF</button>
            </form>
            {pdfVisible && (
                <PDFExport ref={(component) => (this.pdfExportComponent = component)}>
                    {pdfFile()}
                </PDFExport>
            )}
        </div>
    );
};

export default TDCommissionBill;
