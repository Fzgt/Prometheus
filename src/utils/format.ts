import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export const formatDate = (date: string | Date): string => {
	return dayjs(date).format('YYYY年MM月DD日');
};

export const formatRelativeDate = (date: string | Date): string => {
	return dayjs(date).fromNow();
};

export const formatReadingTime = (minutes: number): string => {
	if (minutes < 1) return '不足 1 分钟阅读';
	return `${Math.ceil(minutes)} 分钟阅读`;
};
