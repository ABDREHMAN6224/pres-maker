"use client";

import { useCopilotAction, useCopilotContext,CopilotTask, useCopilotReadable } from "@copilotkit/react-core";
import {
  useMakeCopilotActionable,
  useMakeCopilotReadable,
} from "@copilotkit/react-core";
import { useEffect, useState } from "react";
import "./../presentation/styles.css";
import Markdown from "react-markdown";
import pptxgen from "pptxgenjs";
import { FaChevronCircleLeft, FaChevronCircleRight, FaPlus, FaTrash, FaTruckLoading } from "react-icons/fa";



interface Slide {
  title: string;
  content: string;
  backgroundImage: string;
  speech: string;
}
const convertToPPtTextFromMarkdown = (str: string) => {
  return str.replace(/\n/g, "\n\n").replace(/#/g, "").replace(/\*/g, "-");
}

const convertToPPT = (slides: Slide[]) => {
  const pptx = new pptxgen();
  slides.forEach((slide) => {
   let slidePPt= pptx.addSlide();
   slidePPt.addImage({ path: slide.backgroundImage, x: 0, y: 0, w: "100%", h: "100%" });
    slidePPt.addText(convertToPPtTextFromMarkdown(slide.title), { x: 1, y: 1, w: "80%", h: 1, fontSize: 18, color: "90EE90" });
    slidePPt.addText(convertToPPtTextFromMarkdown(slide.content), { x: 1, y: 2, w: "80%", h: 1, fontSize: 12, color: "90EE90" });
  });
  pptx.writeFile({fileName:"presentation.pptx"});

}

export function Presentation() {
  const [allSlides, setAllSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  const playSpeech = (speech: string) => {
    if(typeof window === "undefined") return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(speech);
    // set speed
    utterance.rate = 1.25;
    synth.speak(utterance);
  }

  useCopilotReadable({
    description: "current slides=> "+allSlides.map((slide) => slide.content).join("\n"),
    value: allSlides.map((slide) => slide.content).join("\n"),
  })

  const getImage = async (image: string) => {
    const response = await fetch(`https://api.unsplash.com/search/photos/?client_id=beLeaSpQWOx7gFcKUOSfHERn3rrdwq0cVUm1jnDJqRQ&query=${image}`);
    const data = await response.json();
    console.log(data)
    return data.results[0].urls.regular
  }

  useCopilotAction(
    {
      name: "createNewPowerPointSlides",
      description:
      "Add a slide after all the existing slides. Call this function multiple times (atleast 8 times)  to add multiple slides.",
      parameters: [
        {
          name: "title",
          type: "string",
          description:"The topic to display in the presentation slide. Use simple markdown to outline your speech, like a headline.",
          required: true,
        },
        {
          name: "content",
          type: "string",
          description: "The content of the slide. MUST consist of a title, then an empty newline, then a few bullet points. Always between 3-5 bullet points - no more, no less."
          ,
          required: true,
        },
        {
          name: "backgroundImage",
          type: "string",
          description:"What to display in the background of the slide (i.e. 'dog' or 'house').",
          required: true,
        },
        {
          name: "speech",
          type: "string",
          description: "The text to read while presenting the slide. Should be distinct from the slide's content, " +
          "and can include additional context, references, etc. Will be read aloud as-is. " +
          "Should be a few sentences long, clear, and smooth to read." +
          "DO NOT include meta-commentary, such as 'in this slide', 'we explore', etc.",
          required: true,
        },
      ],

      handler: async (args) => {
        console.log("first")
        const image = await getImage(args.backgroundImage);
        console.log(image)
        const newSlide: Slide = {
          title:args.title,
          content: `${args.content}`,
          backgroundImage: image,
          speech: args.speech,
        };
        const updatedSlides = [...allSlides, newSlide];
        setAllSlides(updatedSlides);
        setCurrentSlideIndex(updatedSlides.length - 1);
      }

    },
  );

  

  function formatSlideContent(str:string) {
    const items = str.split('\\n').map(item => `${item.trim()}`).join('\n');
    return items;
  }

  

  const addSlide = new CopilotTask({
    instructions: "Create a new PowerPoint slide",
    actions:[
      {
        name: "createNewPowerPointSlides",
        description: "Create a slide for a PowerPoint presentation. Call this function multiple times to present multiple slides.",
        parameters: [
          {
            name: "title",
            type: "string",
            description: "The topic to display in the presentation slide. Use simple markdown to outline your speech, like a headline.",
            required: true,
          },
          {
            name: "content",
            type: "string",
            description: "The content of the slide. MUST consist of a title, then an empty newline, then a few bullet points. Always between 3-5 bullet points - no more, no less."
            ,
            required: true,
          },
          {
            name: "backgroundImage",
            type: "string",
            description: "What to display in the background of the slide (i.e. 'dog' or 'house').",
            required: true,
          },
          {
            name: "speech",
            type: "string",
            description: "The speech to be spoken when the slide is displayed.",
            required: true,
          },
        ],
        handler: async (args) => {
          console.log("here here")
          const image = await getImage(args.backgroundImage);
          const newSlide: Slide = {
            title: args.title,
            content: `${args.content}`,
            backgroundImage: image,
            speech: args.speech,
          };
          const updatedSlides = [...allSlides, newSlide];
          setAllSlides(updatedSlides);
          setCurrentSlideIndex(updatedSlides.length - 1);
        },
      }
    ],
    includeCopilotReadable: true,
  });



  const context = useCopilotContext();

  const [randomSlideTaskRunning, setRandomSlideTaskRunning] = useState(false);

  const goBack = () => setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  const goForward = () =>
    setCurrentSlideIndex((prev) => Math.min(allSlides.length - 1, prev + 1));

  return (
    <div className="w-full h-lvh max-h-screen overflow-hidden ">
      <div className="flex justify-between items-center px-4 py-3 bg-cyan-900">
        <div className="flex gap-4 items-center">
          <button
          disabled={currentSlideIndex === 0 || randomSlideTaskRunning}

            className="bg-blue-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={goBack}>
            <FaChevronCircleLeft />
          </button>
          <span className="text-white font-bold">{allSlides.length>0?currentSlideIndex + 1:0}/{allSlides.length}</span>
          <button
          disabled={currentSlideIndex === allSlides.length-1 || randomSlideTaskRunning}

            className="bg-blue-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={goForward}>
            <FaChevronCircleRight />
          </button>
          <button
          disabled={allSlides.length === 0 || randomSlideTaskRunning}

            className=" bg-green-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => convertToPPT(allSlides)}>
            Download PPT
          </button>
        </div>
        <div className="flex gap-4">
          <button
          disabled={randomSlideTaskRunning || allSlides.length === 0  }

            className="bg-green-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if(!randomSlideTaskRunning){
                setRandomSlideTaskRunning(true);
                addSlide.run(context)
                .then(() => setRandomSlideTaskRunning(false))
              }
              
            }}
          >
            {randomSlideTaskRunning ? 
              <FaTruckLoading className="animate-spin"/>
            :
            <FaPlus/>
            }
          </button>
          <button
          disabled={allSlides.length === 0 || randomSlideTaskRunning}

            className="bg-red-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setAllSlides([]);
              setCurrentSlideIndex(0);
            }}>
            Reset 
          </button>
          <button
          disabled={allSlides.length === 0 || randomSlideTaskRunning}

            className=" text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-red-500"
            onClick={() => {
              const updatedSlides = [...allSlides];
              updatedSlides.splice(currentSlideIndex, 1);
              setAllSlides(updatedSlides);
              setCurrentSlideIndex(Math.min(updatedSlides.length - 1, currentSlideIndex));
            }}>
            <FaTrash />
          </button>
        </div>

      </div>
        <div className="h-full w-full flex overflow-auto items-center justify-center">
          {allSlides.length > 0 ? (
            <div className="relative w-full h-[80%] flex flex-col items-center justify-center border border-gray-400 rounded-md"
              style={{
                backgroundImage: `url(${allSlides[currentSlideIndex].backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backdropFilter: "blur(4px) grayscale(0.5) brightness(0.7)",

              }}
            >
              <div className="absolute bottom-[50px] right-4 -translate-x-1/2  bg-black bg-opacity-50 flex items-center justify-center">
                <button
                  className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
                  onClick={()=>playSpeech(allSlides[currentSlideIndex].speech)}>
                  Play Speech
                </button>
              </div>
              <div className="w-full  flex flex-col overflow-auto p-6 gap-8">
                <div className="w-full flex flex-1 flex-col items-center p-8 bg-yellow-200 bg-opacity-70 rounded-md">
                <Markdown className="markdown text-2xl text-green-900 mb-4 font-semibold">{allSlides[currentSlideIndex].title}</Markdown>
                  <Markdown className="text-lg text-left text-green-600 markdown">{formatSlideContent(allSlides[currentSlideIndex].content)}</Markdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <h1 className="text-4xl font-bold text-center text-gray-200">No slides added yet</h1>
            </div>
          )}          
      </div>
    </div>
  );
}
