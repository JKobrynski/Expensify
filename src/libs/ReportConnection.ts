import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import * as PriorityModeActions from './actions/PriorityMode';
import * as ReportHelperActions from './actions/Report';

// Dynamic Import to avoid circular dependency
const UnreadIndicatorUpdaterHelper = () => import('./UnreadIndicatorUpdater');

const reportIDToNameMap: Record<string, string> = {};
let allReports: OnyxCollection<Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
        UnreadIndicatorUpdaterHelper().then((module) => {
            module.triggerUnreadUpdate();
        });
        // Each time a new report is added we will check to see if the user should be switched
        PriorityModeActions.autoSwitchToFocusMode();

        if (!value) {
            return;
        }
        Object.values(value).forEach((report) => {
            if (!report) {
                return;
            }
            reportIDToNameMap[report.reportID] = report.reportName ?? report.reportID;
            ReportHelperActions.handleReportChanged(report);
        });
    },
});

// This function is used to get all reports
function getAllReports() {
    return allReports;
}

// This function is used to get all reports name map
function getAllReportsNameMap() {
    return reportIDToNameMap;
}

function getAllReportsLength() {
    return Object.keys(allReports ?? {}).length;
}

function getReport(reportID: string) {
    if (!reportID || !allReports) {
        return;
    }
    return allReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
}

function updateReportData(reportID: string, reportData?: Partial<Report>) {
    const report = getReport(reportID);

    if (!allReports || !report || !report.reportID) {
        return;
    }

    allReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {
        ...report,
        ...reportData,
    };
}

export {getAllReports, getAllReportsNameMap, getAllReportsLength, updateReportData, getReport};
