import React, { useState } from 'react';

const App = () => {
    let [startHour, setStartHour] = useState("");
    let [startDay, setStartDay] = useState("");
    let [endDay, setEndDay] = useState("");
    let [endHour, setEndHour] = useState("");

    let date = ['2024-10-29 11:56:09', '2024-10-29 10:56:09', '2024-10-29 10:45:09', '2024-10-29 09:33:09', '2024-10-29 10:57', '2024-10-29 10:56:09', '2024-10-29 08:43:09', '2024-10-29 07:56:09', '2024-10-30 06:56:09'];

    const isWithinRange = (itemDateStr) => {
        let itemDate = new Date(itemDateStr);

        let startDateTime = startDay ? new Date(`${startDay}T${startHour || '00:00'}`) : null;
        let endDateTime = endDay ? new Date(`${endDay}T${endHour || '23:59'}`) : null;

        return (!startDateTime || itemDate >= startDateTime) && (!endDateTime || itemDate <= endDateTime);
    };

    return (
        <div>
            <div>
                <input type="date" onChange={(e) => setStartDay(e.target.value)} />
                <input onChange={(e) => setStartHour(e.target.value)} type="text" placeholder='min (HH:mm)' />
                <span>---</span>
                <input type="date" onChange={(e) => setEndDay(e.target.value)} />
                <input onChange={(e) => setEndHour(e.target.value)} type="text" placeholder='max (HH:mm)' />

                <ul>
                    {date
                        .filter((item) => isWithinRange(item)) // Hem tarihi hem saati filtreleme
                        .map((filteredItem, index) => (
                            <li key={index}>{filteredItem}</li>
                        ))}
                </ul>
            </div>
        </div>
    );
};

export default App;
// const currentHour = customerDate.getHours() - 1;
// const currentMinute = customerDate.getMinutes();

// const afterStart = currentHour > startHour || (currentHour == startHour && currentMinute >= startMinute);
// const beforeEnd = currentHour < endHour || (currentHour == endHour && currentMinute <= endMinute);

// let dateMatch = true;
// const resetTime = (date) => {
//     const newDate = new Date(date);
//     newDate.setHours(0, 0, 0, 0)
//     return newDate;
// }
// if (startDate && endDate) {
//     const start = resetTime(startDate);
//     const end = resetTime(endDate);
//     const customerDay = resetTime(customerDate);
//     dateMatch = customerDay >= start && customerDay <= end;
// } else if (startDate) {
//     if (startHour && startMinute) {
//         let hours = customerDate.getHours() - 1
//         let minutes = customerDate.getMinutes()
//     } else {
//         const start = resetTime(startDate);
//         const customerDay = resetTime(customerDate);
//         dateMatch = customerDay >= start;
//     }
// } else if (endDate) {
//     const end = resetTime(endDate);
//     const customerDay = resetTime(customerDate);
//     dateMatch = customerDay <= end;
// }