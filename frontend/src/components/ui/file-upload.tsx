import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";

export const FileUpload = ({
  onChange,
  files = [],
  multiple = true,
  accept,
}: {
  onChange?: (files: File[]) => void;
  files?: File[];
  multiple?: boolean;
  accept?: string;
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(
    null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFileIndex !== null && files[selectedFileIndex]) {
      const file = files[selectedFileIndex];
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    }
    setPreviewUrl(null);
  }, [selectedFileIndex, files]);

  const handleFileChange = (newFiles: File[]) => {
    if (onChange) {
      onChange([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    if (onChange) {
      onChange(files.filter((_, i) => i !== index));
    }
    if (selectedFileIndex === index) {
      setSelectedFileIndex(null);
    } else if (selectedFileIndex !== null && selectedFileIndex > index) {
      setSelectedFileIndex(selectedFileIndex - 1);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: multiple,
    noClick: true,
    accept: accept ? { [accept]: [] } : undefined,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.error(error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-4 md:p-10 group/file block rounded-lg cursor-pointer w-full relative border-2 border-dashed"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-bold text-base">Upload file</p>
          <p className="relative z-20 text-muted-foreground text-base mt-2">
            Drag or drop your files here or click to upload
          </p>
          <div className="relative w-full mt-10 mx-auto min-h-0">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file-" + file.name + "-" + idx}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFileIndex(idx);
                  }}
                  className={cn(
                    "relative z-40 bg-background flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md border cursor-pointer",
                    "shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  )}
                >
                  <div className="flex justify-between w-full items-center gap-4 min-w-0">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-base flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                      title={file.name}
                    >
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm bg-muted whitespace-nowrap"
                    >
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>

                  <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-muted-foreground gap-2 min-w-0">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-1 py-0.5 rounded-md bg-muted max-w-full md:max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
                      title={file.type}
                    >
                      {file.type}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="whitespace-nowrap"
                    >
                      modified{" "}
                      {new Date(file.lastModified).toLocaleDateString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            {!files.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-background border flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-muted-foreground flex flex-col items-center"
                  >
                    Drop it
                    <IconUpload className="h-4 w-4 text-muted-foreground" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-4 w-4 text-muted-foreground" />
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-primary inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* File Detail Modal */}
      {selectedFileIndex !== null && files[selectedFileIndex] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
          onClick={() => setSelectedFileIndex(null)}
        >
          <div
            className="relative bg-background rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedFileIndex(null)}
              className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background rounded-full p-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* File Preview */}
            <div className="p-6">
              {files[selectedFileIndex].type.startsWith("image/") ? (
                <div className="flex justify-center items-center mb-6 bg-muted rounded-lg p-4">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt={files[selectedFileIndex].name}
                      className="max-w-full max-h-[60vh] object-contain rounded"
                    />
                  )}
                </div>
              ) : (
                <div className="flex justify-center items-center mb-6 bg-muted rounded-lg p-12">
                  <div className="text-center">
                    <IconUpload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Preview not available
                    </p>
                  </div>
                </div>
              )}

              {/* File Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">File Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium break-words">
                        {files[selectedFileIndex].name}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p className="font-medium">
                        {(
                          files[selectedFileIndex].size /
                          (1024 * 1024)
                        ).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">
                        {files[selectedFileIndex].type || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Modified</p>
                      <p className="font-medium">
                        {new Date(
                          files[selectedFileIndex].lastModified
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <div className="flex justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      removeFile(selectedFileIndex);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Delete File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
