// Real wedding photos — ordered chronologically per 2025 vision analysis.
// `position` is the per-slide focal point (CSS object-position) for the 16:9 crop.

export interface StorySlide {
  src: string;
  alt: string;
  caption: string;
  position?: string;
}

export const storySlideshowImages: StorySlide[] = [
  { src: "/images/story-slideshow/slide-01.jpg", alt: "Our story photo 01", caption: "", position: "50% 40%" },
  { src: "/images/story-slideshow/slide-02.jpg", alt: "Our story photo 02", caption: "", position: "50% 50%" },
  { src: "/images/story-slideshow/slide-03.jpg", alt: "Our story photo 03", caption: "", position: "50% 50%" },
  { src: "/images/story-slideshow/slide-04.jpg", alt: "Our story photo 04", caption: "", position: "50% 50%" },
  { src: "/images/story-slideshow/slide-05.jpg", alt: "Our story photo 05", caption: "", position: "50% 35%" },
  { src: "/images/story-slideshow/slide-06.jpg", alt: "Our story photo 06", caption: "", position: "50% 50%" },
  { src: "/images/story-slideshow/slide-07.jpg", alt: "Our story photo 07", caption: "", position: "50% 30%" },
  { src: "/images/story-slideshow/slide-08.jpg", alt: "Our story photo 08", caption: "", position: "50% 25%" },
  { src: "/images/story-slideshow/slide-09.jpg", alt: "Our story photo 09", caption: "", position: "50% 50%" },
  { src: "/images/story-slideshow/slide-10.jpg", alt: "Our story photo 10", caption: "", position: "50% 50%" },
  { src: "/images/story-slideshow/slide-11.jpg", alt: "Our story photo 11", caption: "", position: "50% 35%" },
  { src: "/images/story-slideshow/slide-12.jpg", alt: "Our story photo 12", caption: "", position: "50% 35%" },
  { src: "/images/story-slideshow/slide-13.jpg", alt: "Our story photo 13", caption: "", position: "50% 50%" },
  { src: "/images/story-slideshow/slide-14.jpg", alt: "Our story photo 14", caption: "", position: "50% 55%" },
  { src: "/images/story-slideshow/slide-15.jpg", alt: "Our story photo 15", caption: "", position: "50% 50%" },
  { src: "/images/story-slideshow/slide-16.jpg", alt: "Our story photo 16", caption: "", position: "50% 65%" },
  { src: "/images/story-slideshow/slide-17.jpg", alt: "Our story photo 17", caption: "", position: "50% 45%" },
  { src: "/images/story-slideshow/slide-18.jpg", alt: "Our story photo 18", caption: "", position: "45% 45%" },
];
