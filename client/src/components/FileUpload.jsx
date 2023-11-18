import React, { useState } from "react";

const FileUpload = ({ onFileSubmit }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg"];

        if (file && allowedTypes.includes(file.type)) {
            setSelectedFile(file);
        } else {
            setSelectedFile(null);
            alert("Please choose a valid PDF, JPG, or JPEG file.");
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
            <input type="file" accept=".pdf, .jpg, .jpeg" onChange={handleFileChange} />
            <button onClick={handleFileSubmit}>Submit</button>
        </>
    );
};

export default FileUpload;
