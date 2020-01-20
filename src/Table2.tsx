import React from 'react'
import { HotTable } from '@handsontable/react'
import 'handsontable/dist/handsontable.full.css';
import { Note } from './Types'

type Props = {
	notes: Note[]
} 
function Table2(data: Props) {
	return (
		<HotTable data={data.notes} 
			columns={[
				// { data: "id" },
				{ data: "mr.project.name"},
				{ data: "author.name" },
				{ data: "body" }
			]} 
			colWidths={200}
			stretchH={'last'}
			width='100%'
			colHeaders={true} rowHeaders={true}
			licenseKey={'non-commercial-and-evaluation'}/>
	)
}

export default Table2