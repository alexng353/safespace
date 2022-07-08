import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";

const Home: NextPage = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const inputFileRef = React.useRef<HTMLInputElement | null>(null);
  const [links, setLinks] = React.useState<string[]>([]);

  const handleOnClick = async (e: React.MouseEvent<HTMLInputElement>) => {
    /* Prevent form from submitting by default */
    e.preventDefault();

    /* If file is not selected, then show alert message */
    if (!inputFileRef.current?.files?.length) {
      alert("Please, select file you want to upload");
      return;
    }

    setIsLoading(true);

    /* Add files to FormData */
    const formData = new FormData();
    Object.values(inputFileRef.current.files).forEach((file) => {
      formData.append("file", file);
    });

    /* Send request to our api route */
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const body = (await response.json()) as {
      status: "ok" | "fail";
      message: string;
      links: string[];
    };

    // alert(body.message);
    setLinks(body.links);

    if (body.status === "ok") {
      inputFileRef.current.value = "";
      // Do some stuff on successfully upload
    } else {
      // Do some stuff on error
    }

    setIsLoading(false);
  };

  return (
    <div>
      <form>
        <div>
          <input type="file" name="myfile" ref={inputFileRef} multiple />
        </div>
        <div>
          <input
            type="submit"
            value="Upload"
            disabled={isLoading}
            onClick={handleOnClick}
          />
          {isLoading && ` Wait, please...`}
        </div>
      </form>
      {links &&
        links.map((link, index) => {
          return (
          <div key={index} className="p-1"  >
            <a  href={`/uploads/${link}`}>{link}</a>
            &nbsp;&nbsp;
            <button 
            className="border border-red-500 p-1 rounded"
            onClick={() => {
              // copy to clipboard
              navigator.clipboard.writeText(`${window.location.host}/uploads/${link}`);
            }}>Copy</button>
          </div>
          );
        })}
    </div>
  );
};

export default Home;
