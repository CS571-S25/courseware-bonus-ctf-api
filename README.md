build
```bash
docker build . -t ctnelson1997/cs571-s25-bonus-api
docker push ctnelson1997/cs571-s25-bonus-api
```

run
```bash
docker pull ctnelson1997/cs571-s25-bonus-api
docker run --name=cs571_s25_bonus_api -d --restart=always -p 58822:58822 -v /cs571/s25/bonus:/cs571 ctnelson1997/cs571-s25-bonus-api
```