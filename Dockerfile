FROM nginx:alpine
COPY dist/apps/journal/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]