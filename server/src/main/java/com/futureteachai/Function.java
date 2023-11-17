package com.futureteachai;
import java.io.ByteArrayInputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

public class Function {
    @FunctionName("ProcessPdf")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req", methods = { HttpMethod.POST }, authLevel = AuthorizationLevel.ANONYMOUS) HttpRequestMessage<Optional<byte[]>> request,
            final ExecutionContext context) {
        context.getLogger().info("Java HTTP trigger processed a request.");

        if (request.getBody().isPresent()) {
            try {
                String connectionString = System.getenv("AzureWebJobsStorage");
                BlobServiceClient blobServiceClient = new BlobServiceClientBuilder().connectionString(connectionString).buildClient();
                
                String containerName = "pdf-container";
                BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);

                String baseBlobName = "file"; // base name
                String uniqueBlobName = baseBlobName + "-" + generateUniqueIdentifier();
                BlobClient blobClient = containerClient.getBlobClient(uniqueBlobName);

                ByteArrayInputStream inputStream = new ByteArrayInputStream(request.getBody().get());
                blobClient.upload(inputStream, request.getBody().get().length, true);
                String blobUrl = String.format("https://%s.blob.core.windows.net/%s/%s",blobServiceClient.getAccountName(), containerName, uniqueBlobName);

                return request.createResponseBuilder(HttpStatus.OK).body(blobUrl).build();
            } catch (Exception e) {
                context.getLogger().severe("Error handling file upload: " + e.getMessage());
                return request.createResponseBuilder(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error handling file upload").build();
            }
        } else {
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body("Please upload a file").build();
        }
    }

    private String generateUniqueIdentifier() {
        // Using a timestamp and UUID to create a unique identifier
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd-HHmmssSSS");
        String timestamp = dateFormat.format(new Date());
        UUID uuid = UUID.randomUUID();
        return timestamp + "-" + uuid.toString();
    }
}