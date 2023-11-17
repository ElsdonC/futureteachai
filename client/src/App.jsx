import React from 'react';
import FileUpload from './components/FileUpload';

function App() {

  const handleFileSubmit = (file) => {
    // send file to backend
    console.log("file submitted: " + file.name);
  }

  return (
    <>
      <FileUpload onFileSubmit={handleFileSubmit}/>
    </>
  );
}

export default App;
