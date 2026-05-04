// @ts-nocheck
// @ts-nocheck
import * as React from "react";
import lunr from "lunr";
import stemmer from "lunr-languages/lunr.stemmer.support";
import multi from "lunr-languages/lunr.multi";
import zh from "@/lib/lunr.zh";
import pt from "lunr-languages/lunr.pt";

stemmer(lunr);
zh(lunr);
pt(lunr);
multi(lunr);
const multiLang = lunr.multiLanguage("en", "zh");

interface IData { [key: string]: any }
interface ILunrIdx { ref: string }

function createLunrIndex(ref: string, indexArr: Array<string>, data: Array<IData>) {
	return lunr(function () {
		this.use(multiLang);
		this.tokenizer = (x: any) => lunr.tokenizer(x).concat(lunr.zh.tokenizer(x));
		this.ref(ref);
		for (let i = 0; i < indexArr.length; i++) { this.field(indexArr[i]) }
		for (let i = 0; i < data.length; i++) { this.add(data[i]) }
	});
}

export function useLunr(
	query: string, ref: string, indexArr: Array<string>, data: Array<IData>
) {
	const matches = React.useMemo(() => {
		const index = createLunrIndex(ref, indexArr, data);
		return index.search(query).map((idx: ILunrIdx) => data.find(item => item[ref].toString() === idx.ref));
	}, [query, ref, indexArr, data]);

	return matches;
}