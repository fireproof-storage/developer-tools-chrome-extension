import{R as ResolveOnce,g as getPath}from"./index-CZTnwKAA.js";import{o as openDB}from"./index-B0W44gDG.js";var KeyBagProviderIndexDB=class{constructor(url,sthis){this._db=new ResolveOnce,this.sthis=sthis,this.logger=sthis.logger,this.url=url,this.dbName=getPath(this.url,this.sthis)}async _prepare(){return this._db.once(async()=>await openDB(this.dbName,1,{upgrade(db){["bag"].map(store=>{db.createObjectStore(store,{autoIncrement:!1})})}}))}async get(id){const tx=(await this._prepare()).transaction(["bag"],"readonly"),keyItem=await tx.objectStore("bag").get(id);if(await tx.done,!!keyItem)return keyItem}async set(id,item){const tx=(await this._prepare()).transaction(["bag"],"readwrite");await tx.objectStore("bag").put(item,id),await tx.done}};export{KeyBagProviderIndexDB};
