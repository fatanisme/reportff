import React, {useState} from 'react';
import DateInput from '../../ui/DateInput';
import ButtonExport from '../ButtonExport'   

export default function filterTglSection({ region,area }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 items-end">
            <div>
                <label className="block text-sm font-medium">Mulai Dari</label>
                <DateInput
                    value={startDate} onChange={setStartDate}
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Sampai Dengan</label>
                <DateInput
                    value={endDate} onChange={setEndDate}
                />
            </div>
            <ButtonExport
                startDate = {startDate}
                endDate = {endDate}
                region = {region}
                area = {area}
            />
        </div>
    );
}
