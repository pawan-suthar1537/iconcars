"use client";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Camera, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { processImageSearch } from "@/actions/home";

const HomeSearch = () => {
  const [serchterm, setserchterm] = useState("");
  const [isimageserchactive, setisimageserchactive] = useState(false);
  const [imagepreview, setimagepreview] = useState("");
  const [searchimage, setsearchimage] = useState(null);
  const [isuploading, setisuploading] = useState(false);

  const router = useRouter();

  const {
    loading: processImageSearchloading,
    fn: processImageSearchfn,
    data: processImageSearchdata,
    error: processImageSearcherror,
  } = useFetch(processImageSearch);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serchterm.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    router.push(`/cars?search=${encodeURIComponent(serchterm)}`);
  };
  const handleImageSearch = async (e) => {
    e.preventDefault();
    if (!searchimage) {
      toast.error("Please upload an image");
      return;
    }
    await processImageSearchfn(searchimage);
  };

  useEffect(() => {
    if (processImageSearcherror) {
      toast.error(
        `failed to Analyze car image ${
          processImageSearcherror.message || "Unknown Error"
        }`
      );
    }
  }, [processImageSearcherror]);
  useEffect(() => {
    if (processImageSearchdata?.success) {
      const params = new URLSearchParams();

      if (processImageSearchdata.data.make)
        params.set("make", processImageSearchdata.data.make);
      if (processImageSearchdata.data.bodyType)
        params.set("bodyType", processImageSearchdata.data.bodyType);
      if (processImageSearchdata.data.color)
        params.set("color", processImageSearchdata.data.color);

      router.push(`/cars?${params.toString()}`);
    }
  }, [processImageSearchdata]);
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image Size Must be less than 5mb");
        return;
      }
      setisuploading(true);
      setsearchimage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setimagepreview(reader.result);
        setisuploading(false);
        toast.success("Image Uploaded");
      };
      reader.onerror = () => {
        setisuploading(false);
        toast.error("Error uploading image");
      };
      reader.readAsDataURL(file);
    }
  };
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "/image/*": [".jpg", ".jpeg", ".png"],
      },
      maxFiles: 1,
    });
  return (
    <div>
      <form action="" onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="enter car, model to ai serch"
            value={serchterm}
            onChange={(e) => setserchterm(e.target.value)}
            className="pl-10 pr-12 py-6 w-full rounded-full border-gray-300 bg-white/95 backdrop-blur-sm"
          />
          <div className="absolute right-[100px]">
            <Camera
              size={35}
              onClick={() => setisimageserchactive(!isimageserchactive)}
              className="cursor-pointer rounded-xl p-1.5"
              style={{
                background: isimageserchactive ? "black" : "",
                color: isimageserchactive ? "white" : "",
              }}
            />
          </div>
          <Button
            type="submit"
            className="absolute right-2 rounded-full cursor-pointer"
          >
            Search
          </Button>
        </div>
      </form>
      {isimageserchactive && (
        <div className="mt-4">
          <form action="" onSubmit={handleImageSearch}>
            <div className="border-2 border-dashed border-gray-300 rounded-3xl  p-6 text-center">
              {imagepreview ? (
                <div className="flex flex-col  items-center">
                  <img
                    src={imagepreview}
                    alt="car preview"
                    className="h-40 object-contain mb-4"
                  />
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    onClick={() => {
                      setsearchimage(null);
                      setimagepreview("");
                      toast.info("Image Removed");
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12  text-gray-500 mb-2" />
                    <p>
                      {isDragActive && !isDragReject
                        ? "Leave the file here to upload"
                        : "Drag & Drop car image for search"}
                    </p>
                    {isDragReject && (
                      <p className="text-red-500 mb-2 ">Invalid Image Type</p>
                    )}
                    <p className="text-gray-400 text-sm">
                      Supports: JPG,PNG (max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
            {imagepreview && (
              <Button
                type="submit"
                className="w-full mt-2 cursor-pointer"
                disabled={isuploading || processImageSearchloading}
              >
                {isuploading
                  ? "Uploading..."
                  : processImageSearchloading
                  ? "Analyzing Image "
                  : "Search with this image"}
              </Button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default HomeSearch;
