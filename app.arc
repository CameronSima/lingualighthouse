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

note
  pk *String  # userId
  sk **String # noteId

transcript
  pk *String  # videoId
  sk **String # transcriptId

video
  pk *String  # channelId
  sk **String # videoId

@tables-indexes
video
  channelId *String
  name byChannelId
  projection keys

@aws
timeout 600
memory 2000
concurrency 10  
region us-west-1

