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

job
  pk *String # channelId
  expires TTL

search
  pk *String #  userId
  sk **String # searchId

@tables-indexes
video
  channelId *String
  name byChannelId

@queues
jobHandler
  src backend/dist/queues/jobHandler
  BatchSize 1
  MaximumBatchingWindowInSeconds 1
  VisibilityTimeout 30
  MaximumReceives 3

@aws
fifo false
timeout 600
memory 500
concurrency 5
region us-east-1
runtime nodejs18.x

@plugins
batchSize