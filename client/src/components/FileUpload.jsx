import React, { useState } from "react";

const FileUpload = ({ onFileSubmit }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "application/pdf") {
            setSelectedFile(file);
        } else {
            setSelectedFile(null);
            alert("Please choose a valid PDF file.");
        }
    };

    const handleFileSubmit = () => {
        if (selectedFile) {
            onFileSubmit(selectedFile);
        } else {
            alert("Please select a file first.");
        }
    };

    return (
        <>
            <input type="file" accept=".pdf" onChange={handleFileChange} />
            <button onClick={handleFileSubmit}>Submit</button>
        </>
    );
};

export default FileUpload;
