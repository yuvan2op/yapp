FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS production

RUN rm /etc/nginx/conf.d/default.conf \
	&& sed -i 's#pid        /run/nginx.pid;#pid        /tmp/nginx.pid;#' /etc/nginx/nginx.conf \
	&& mkdir -p /var/cache/nginx /var/run/nginx /tmp/nginx \
	&& chown -R nginx:nginx /var/cache/nginx /var/run/nginx /tmp/nginx /etc/nginx 
  
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

RUN chown -R nginx:nginx /usr/share/nginx/html

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]