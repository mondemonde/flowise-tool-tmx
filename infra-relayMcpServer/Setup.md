# Relay Project Docker Deployment Guide

This guide describes how to build, push, and deploy the Relay project Docker image to Azure Container Registry (ACR) and configure it for use in Azure App Service or other environments.

---

## 1. Prerequisites

- Docker installed and running
- Azure CLI installed and logged in (`az login`)
- Access to the Azure subscription and ACR
- Relay project source code and Dockerfile

---

## 2. Build and Tag the Docker Image

From the root of your relay project (where the Dockerfile is located):

```sh
docker build -t relay:latest .
docker tag relay:latest ***REMOVED***.azurecr.io/relay:latest
```

---

## 3. Retrieve ACR Admin Username and Password

You need the ACR admin username and password to push images and configure App Service.

**Show the ACR admin credentials:**

```sh
az acr credential show --name ***REMOVED***
```

- The username is usually the ACR name (e.g., `***REMOVED***`).
- The password is in the `passwords[0].value` field of the output.

---

## 4. Login to Azure Container Registry

```sh
docker login ***REMOVED***.azurecr.io
```
- Enter the username and password from the previous step when prompted.

---

## 5. Push the Docker Image to ACR

```sh
docker push ***REMOVED***.azurecr.io/relay:latest
```

---

## 6. Configure Azure App Service (Linux) to Use the Image

In the Azure Portal or via Terraform, set the following App Settings for your Web App:

- `DOCKER_REGISTRY_SERVER_URL` = `https://***REMOVED***.azurecr.io`
- `DOCKER_REGISTRY_SERVER_USERNAME` = `<your-acr-username>`
- `DOCKER_REGISTRY_SERVER_PASSWORD` = `<your-acr-password>`
- `DOCKER_CUSTOM_IMAGE_NAME` = `***REMOVED***.azurecr.io/relay:latest`

Restart the App Service after updating these settings.

---

## 7. Troubleshooting

- If you see `ImagePullFailure`, double-check the image name, tag, and credentials.
- Ensure the image exists in ACR:  
  ```sh
  az acr repository show-tags --name ***REMOVED*** --repository relay
  ```
- Make sure the App Service has access to ACR (correct credentials, no firewall blocking).

---

## References

- [Azure Container Registry Documentation](https://docs.microsoft.com/en-us/azure/container-registry/)
- [Deploy Docker containers to App Service](https://docs.microsoft.com/en-us/azure/app-service/tutorial-custom-docker-image)


# retrieve credential
az acr credential show --name ***REMOVED***

{
  "passwords": [
    {
      "name": "password",
      "value": "***REMOVED***"
    },
    {
      "name": "password2",
      "value": "***REMOVED***"
    }
  ],
  "username": "***REMOVED***"
}
