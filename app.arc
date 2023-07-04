@app
yt_search_remix-abeb

@http
/*
  method any
  src server

@static

@tables
user
  pk *String

password
  pk *String # userId

transcript
  pk *String  # videoId
  sk **String # transcriptId

video
  pk *String  # channelId
  sk **String # videoId

channel
  pk *String # channelId
  sk **String 

searchChannelJob
  pk *String # channelId

@tables-indexes
video
  channelId *String
  name byChannelId

@aws
timeout 600
memory 2000
concurrency 10  
region us-east-1
runtime nodejs18.x
