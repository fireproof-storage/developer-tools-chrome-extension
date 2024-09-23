import{K as KeyedResolvOnce,e as ensureLogger,a as exception2Result,b as Result,c as exceptionWrapper,d as getStore,f as getKey,N as NotFoundError,I as INDEXDB_VERSION}from"./index-CZTnwKAA.js";import{o as openDB}from"./index-B0W44gDG.js";function ensureVersion(url){return url.build().defParam("version",INDEXDB_VERSION).URI()}var onceIndexDB=new KeyedResolvOnce;function sanitzeKey(key){return key.length===1&&(key=key[0]),key}async function connectIdb(url,sthis){const dbName=getIndexDBName(url,sthis),once=await onceIndexDB.get(dbName.fullDb).once(async()=>{const db=await openDB(dbName.fullDb,1,{upgrade(db2){["version","data","wal","meta","idx.data","idx.wal","idx.meta"].map(store=>{db2.createObjectStore(store,{autoIncrement:!1})})}}),found=await db.get("version","version"),version=ensureVersion(url).getParam("version");return found?found.version!==version&&sthis.logger.Warn().Str("url",url.toString()).Str("version",version).Str("found",found.version).Msg("version mismatch"):await db.put("version",{version},"version"),{db,dbName,version,url}});return{...once,url:url.build().setParam("version",once.version).URI()}}function joinDBName(...names){return names.map(i=>i.replace(/^[^a-zA-Z0-9]+/g,"").replace(/[^a-zA-Z0-9]+/g,"_")).filter(i=>i.length).join(".")}function getIndexDBName(iurl,sthis){const url=ensureVersion(iurl),fullDb=url.pathname.replace(/^\/+/,"").replace(/\?.*$/,""),dbName=url.getParam("name");if(!dbName)throw sthis.logger.Error().Str("url",url.toString()).Msg("name not found").AsError();const result=joinDBName(fullDb,dbName),objStore=getStore(url,sthis,joinDBName).name,connectionKey=[result,objStore].join(":");return{fullDb:result,objStore,connectionKey,dbName}}var IndexDBGateway=class{constructor(sthis){this._db={},this.logger=ensureLogger(sthis,"IndexDBGateway"),this.sthis=sthis}async start(baseURL){return exception2Result(async()=>{this.logger.Debug().Url(baseURL).Msg("starting"),await this.sthis.start();const ic=await connectIdb(baseURL,this.sthis);return this._db=ic.db,this.logger.Debug().Url(ic.url).Msg("started"),ic.url})}async close(){return Result.Ok(void 0)}async destroy(baseUrl){return exception2Result(async()=>{const type=getStore(baseUrl,this.sthis,joinDBName).name,trans=this._db.transaction(type,"readwrite"),object_store=trans.objectStore(type),toDelete=[];for(let cursor=await object_store.openCursor();cursor;cursor=await cursor.continue())toDelete.push(cursor.primaryKey);for(const key of toDelete)await trans.db.delete(type,key);await trans.done})}buildUrl(baseUrl,key){return Promise.resolve(Result.Ok(baseUrl.build().setParam("key",key).URI()))}async get(url){return exceptionWrapper(async()=>{const key=getKey(url,this.logger),store=getStore(url,this.sthis,joinDBName).name;this.logger.Debug().Url(url).Str("key",key).Str("store",store).Msg("getting");const tx=this._db.transaction([store],"readonly"),bytes=await tx.objectStore(store).get(sanitzeKey(key));return await tx.done,bytes?Result.Ok(bytes):Result.Err(new NotFoundError(`missing ${key}`))})}async put(url,value){return exception2Result(async()=>{const key=getKey(url,this.logger),store=getStore(url,this.sthis,joinDBName).name;this.logger.Debug().Url(url).Str("key",key).Str("store",store).Msg("putting");const tx=this._db.transaction([store],"readwrite");await tx.objectStore(store).put(value,sanitzeKey(key)),await tx.done})}async delete(url){return exception2Result(async()=>{const key=getKey(url,this.logger),store=getStore(url,this.sthis,joinDBName).name;this.logger.Debug().Url(url).Str("key",key).Str("store",store).Msg("deleting");const tx=this._db.transaction([store],"readwrite");return await tx.objectStore(store).delete(sanitzeKey(key)),await tx.done,Result.Ok(void 0)})}},IndexDBTestStore=class{constructor(sthis){this.sthis=sthis,this.logger=ensureLogger(sthis,"IndexDBTestStore",{})}async get(url,key){const ic=await connectIdb(url,this.sthis),store=getStore(ic.url,this.sthis,joinDBName).name;this.logger.Debug().Str("key",key).Str("store",store).Msg("getting");let bytes=await ic.db.get(store,sanitzeKey(key));return this.logger.Debug().Str("key",key).Str("store",store).Int("len",bytes.length).Msg("got"),typeof bytes=="string"&&(bytes=this.sthis.txt.encode(bytes)),bytes}};export{IndexDBGateway,IndexDBTestStore,getIndexDBName};