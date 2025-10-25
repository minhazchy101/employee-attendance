// src/api/utils/imageUpload.js
const imageUpload = async (imageFile) => {
  if (!imageFile) throw new Error("No image file provided.");

  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("fileName", imageFile.name);

  const response = await fetch(
    "https://upload.imagekit.io/api/v1/files/upload",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(
          import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY + ":"
        )}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) throw new Error("Image upload failed");

  return data.url; // ✅ hosted image URL
};

export default imageUpload;
