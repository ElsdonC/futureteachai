import React, { useState } from "react";
import FileUpload from "./components/FileUpload";

function App() {
    const [uploadStatus, setUploadStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResults, setAnalysisResults] = useState(null);
    const endpoint = process.env.REACT_APP_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const key = process.env.REACT_APP_DOCUMENT_INTELLIGENCE_KEY;
    const modelID = "prebuilt-document";

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
                analyze(pdfUrl);
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

    const analyze = async (documentUrl) => {
        try {
            setAnalyzing(true);
            const apiUrl = `${endpoint}/formrecognizer/documentModels/${modelID}:analyze?api-version=2023-07-31`;

            const headers = new Headers();
            headers.append("Content-Type", "application/json");
            headers.append("Ocp-Apim-Subscription-Key", key);

            const requestBody = JSON.stringify({ urlSource: documentUrl });

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: headers,
                body: requestBody,
            });

            if (response.ok) {
                const resultId = response.headers.get("Operation-Location");
                setTimeout(() => fetchAnalysisResult(resultId), 5000);
            } else {
                console.error(
                    "Failed to start document analysis. HTTP status:",
                    response.status
                );
            }
        } catch (error) {
            console.error("Could not analyze file", error);
        }
    };

    const fetchAnalysisResult = async (resultId) => {
        try {
            const apiUrl = resultId;
            const headers = new Headers();
            headers.append("Ocp-Apim-Subscription-Key", key);

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: headers,
            });

            if (response.ok) {
                const result = await response.json();
                setAnalysisResults(JSON.stringify(result));

                // Extract and display "content" text
                const contentText = result.analyzeResult.content;
                console.log("Content Text:", contentText);
            } else {
                console.error(
                    "Failed to fetch analysis result. HTTP status:",
                    response.status
                );
            }
        } catch (error) {
            console.error("Error analyzing file", error);
        } finally {
            setAnalyzing(false);
        }
    };


    return (
        <>
            <FileUpload onFileSubmit={handleFileSubmit} />
            {loading && <p>Uploading...</p>}
            {uploadStatus && <p>{uploadStatus}</p>}
            {analyzing && <p>Analyzing...</p>}
            {analysisResults && <p>Analysis: {analysisResults}</p>}
        </>
    );
}

export default App;
