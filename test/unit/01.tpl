<template key="sss">
	<div class="c-atom-aftclk"
	 :tt = "xx|auto"
	  v-show:emm.abcd.efgh="show"
	  @click.native = 'lalalala'>
	 <c-title
	     class="c-atom-aftclk-title"
	     :text="title"
	     icon="baidu"/>
	 <div class="c-scroll-wrapper">
	     <div class="c-scroll-touch">
	         <div class="c-gap-bottom-small">
	             <template v-for="(rsitem, index) in upList">
	                 <c-slink
	                     :url="rsitem.href"
	                     class="c-scroll-item"
	                     :text="rsitem.text"
	                     type="auto"></c-slink>
	             </template>
	         </div>
	         <div>
	             <template v-for="(rsitem, index) in downList">
	                 <c-slink
	                     :url="rsitem.href"
	                     class="c-scroll-item"
	                     :text="rsitem.text"
	                     type="auto"></c-slink>
	             </template>
	         </div>
	     </div>
	 </div>
	 <div class="c-atom-aftclk-cover"></div>
	</div>
</template>