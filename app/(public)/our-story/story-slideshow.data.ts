// Real wedding photos — order matches slide-01..18 in public/images/story-slideshow/. Add caption text per slide if desired.

export interface StorySlide {
  src: string;
  alt: string;
  caption: string;
}

export const storySlideshowImages: StorySlide[] = [
  { src: "/images/story-slideshow/slide-01.jpg", alt: "Our story photo 1", caption: "" },
  { src: "/images/story-slideshow/slide-02.jpg", alt: "Our story photo 2", caption: "" },
  { src: "/images/story-slideshow/slide-03.jpg", alt: "Our story photo 3", caption: "" },
  { src: "/images/story-slideshow/slide-04.jpg", alt: "Our story photo 4", caption: "" },
  { src: "/images/story-slideshow/slide-05.jpg", alt: "Our story photo 5", caption: "" },
  { src: "/images/story-slideshow/slide-06.jpg", alt: "Our story photo 6", caption: "" },
  { src: "/images/story-slideshow/slide-07.jpg", alt: "Our story photo 7", caption: "" },
  { src: "/images/story-slideshow/slide-08.jpg", alt: "Our story photo 8", caption: "" },
  { src: "/images/story-slideshow/slide-09.jpg", alt: "Our story photo 9", caption: "" },
  { src: "/images/story-slideshow/slide-10.jpg", alt: "Our story photo 10", caption: "" },
  { src: "/images/story-slideshow/slide-11.jpg", alt: "Our story photo 11", caption: "" },
  { src: "/images/story-slideshow/slide-12.jpg", alt: "Our story photo 12", caption: "" },
  { src: "/images/story-slideshow/slide-13.jpg", alt: "Our story photo 13", caption: "" },
  { src: "/images/story-slideshow/slide-14.jpg", alt: "Our story photo 14", caption: "" },
  { src: "/images/story-slideshow/slide-15.jpg", alt: "Our story photo 15", caption: "" },
  { src: "/images/story-slideshow/slide-16.jpg", alt: "Our story photo 16", caption: "" },
  { src: "/images/story-slideshow/slide-17.jpg", alt: "Our story photo 17", caption: "" },
  { src: "/images/story-slideshow/slide-18.jpg", alt: "Our story photo 18", caption: "" },
];
