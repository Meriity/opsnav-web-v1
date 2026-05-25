import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const createTaskAllocationPDFDoc = (Allocated) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 🔹 Fetch data from localStorage
    const storedData = localStorage.getItem("client-storage");
    if (!storedData) {
        throw new Error("No client-storage found in localStorage");
    }

    const parsed = JSON.parse(storedData);
    const tasks = parsed.state.clients || [];

    // 🔹 Sort tasks by rankOrder (ascending - lower rank first)
    const sortedTasks = [...tasks].sort((a, b) => {
        const rankA = (a.rankOrder !== undefined && a.rankOrder !== null) ? Number(a.rankOrder) : Infinity;
        const rankB = (b.rankOrder !== undefined && b.rankOrder !== null) ? Number(b.rankOrder) : Infinity;
        return rankA - rankB;
    });

    // 🔹 Define color map
    const stageColors = {
        green: { label: "Completed", color: [0, 204, 0] },
        amber: { label: "In Progress", color: [204, 153, 0] },
        red: { label: "Pending", color: [255, 51, 51] },
    };

    // 🔹 Helper to format stage progress text
    const renderStageProgress = (stageArray) => {
        if (!Array.isArray(stageArray) || !stageArray.length) return "N/A";
        const stageObj = stageArray[0];
        const keys = ["S1", "S2", "S3", "S4"];
        return keys
            .map((key) => {
                const color = stageObj[key];
                const label = stageColors[color]?.label || "N/A";
                return `${key}: ${label}`;
            })
            .join("\n");
    };

    // 🔹 Title
    doc.setFontSize(16);
    doc.text("Task Allocation Report - IDG Services", 14, 15);

    // 🔹 Headers
    const headers = [
        [
            "Order ID",
            "Client Name",
            "Order Date",
            "Delivery Date",
            "Order Details",
            "Unit",
            "Billing Address",
            "Stage Progress",
            "Allocated User",
        ],
    ];

    // 🔹 Prepare rows from sorted data
    const rows = sortedTasks.map((task) => [
        task.orderId || "N/A",
        task.client_name || "N/A",
        task.order_date || "N/A",
        task.delivery_date || "N/A",
        task.orderDetails || "N/A",
        task.unitNumber || "N/A",
        task.billing_address || "N/A",
        task.stages || [], // array of one object
        task.allocatedUser || "N/A",
    ]);

    // 🔹 Optional: filter by allocated user
    let finalRows = rows;
    if (Allocated && Allocated.trim() !== "") {
        finalRows = rows.filter((row) => row[8] === Allocated);
    }

    // 🔹 Table rendering
    autoTable(doc, {
        head: headers,
        body: finalRows.map((row) => [
            row[0],
            row[1],
            row[2],
            row[3],
            row[4],
            row[5],
            row[6],
            renderStageProgress(row[7]),
            row[8],
        ]),
        startY: 25,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2, minCellHeight: 10 },
        columnStyles: {
            0: { cellWidth: 15 }, // Order ID
            1: { cellWidth: 20 }, // Client Name
            2: { cellWidth: 20 }, // Order Date
            3: { cellWidth: 20 }, // Delivery Date
            4: { cellWidth: 25 }, // Order Details
            5: { cellWidth: 12 }, // Unit
            6: { cellWidth: 35 }, // Billing Address
            7: { cellWidth: 25 }, // Stage Progress
            8: { cellWidth: 20 }, // Allocated User
        },
        headStyles: {
            fillColor: [41, 128, 185], // 🔹 Header background color (blue tone)
            textColor: [255, 255, 255], // 🔹 Header text color (white)
            fontStyle: "bold",
            halign: "center",
            valign: "middle",
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245], // light gray rows for contrast
        },
    });


    // 🔹 Footer
    doc.setFontSize(10);
    doc.setTextColor(180, 180, 180);
    doc.text("Powered by OpsNav", pageWidth / 2, pageHeight - 10, {
        align: "center",
    });

    return doc;
};

export const generateTaskAllocationPDF = (Allocated) => {
    try {
        const doc = createTaskAllocationPDFDoc(Allocated);
        doc.save(`TAR - ${new Date().toLocaleDateString("en-GB")}.pdf`);
    } catch (err) {
        console.error("Error generating PDF:", err);
    }
};

export const getTaskAllocationBlobUrl = (Allocated) => {
    try {
        const doc = createTaskAllocationPDFDoc(Allocated);
        const blob = doc.output("blob");
        return URL.createObjectURL(blob);
    } catch (err) {
        console.error("Error generating PDF Blob URL:", err);
        return null;
    }
};
