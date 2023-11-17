import React, { useState } from "react";
import FileUpload from "./components/FileUpload";

function App() {
    const [uploadStatus, setUploadStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileSubmit = async (file) => {
        if (file.type !== "application/pdf") {
            setUploadStatus("Please upload a PDF file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            const response = await fetch(
                "https://futureteachai.azurewebsites.net/api/ProcessPdf",
                {
                    method: "POST",
                    body: formData,
                }
            );
            if (response.ok) {
                setUploadStatus("File uploaded successfully");
                const pdfUrl = await response.text();
                console.log(pdfUrl);
            } else {
                const errorMessage = await response.text();
                setUploadStatus(`Failed to upload file: ${errorMessage}`);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            setUploadStatus("Error uploading file. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <FileUpload onFileSubmit={handleFileSubmit} />
            {loading && <p>Uploading...</p>}
            {uploadStatus && <p>{uploadStatus}</p>}
        </>
    );
}

export default App;
