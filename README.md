# Overview

This project started when I was learning about raytracing through this awesome book: [Ray Tracing in One Weekend](https://raytracing.github.io/books/RayTracingInOneWeekend.html) by Peter Shirley. We are creating the Ray Tracing renderer using the PPM image file format because it's one of the easiest formats to work with.

The problem is Windows does not support viewing PPM files out of the box. I wanted to create a quick way to load and view a PPM file without needing to install any external applications. This web tool was made to solve this problem and it is fast and light-weight.

DEMO: http://ppm-image-viewer.s3-website.us-east-2.amazonaws.com/

# Features
- Load PPM image files by using the file browser or drag and drop
- Input validation that provides meaningful error messages
- Shrink or magnify images (can choose whether to maintain aspect ratio)
- Save the image as a PNG

![App Preview](https://i.imgur.com/FmKjQRZ.png)

# Notes
This project could have been done without React, but it is one of the most popular front-end web development frameworks at the moment. I wanted to use this opportunity to practice using this framework.

Here is a PPM file that you can try out on the web app: https://www.dropbox.com/s/aa2s8cxa2omrnqy/image.ppm \
Don't worry, PPM files are actually just harmless text files containing image data. Try editing it with a text editor! \
[Click Here](https://en.wikipedia.org/wiki/Netpbm#PPM_example) to learn more about the PPM image file format 😊

