/**
 * =============================================================================
 * 📖 MSW 内存数据库 (@mswjs/data)
 * =============================================================================
 *
 * 【知识点 - @mswjs/data 是什么？】
 * 它是 MSW 团队开发的内存数据库库，让 mock API 拥有真实的 CRUD 能力。
 * 相比直接返回静态 JSON，@mswjs/data 支持：
 *   - 创建、查询、更新、删除数据
 *   - 主键约束（primaryKey）
 *   - 按条件查询（findMany、findFirst、where）
 *   - 数据持久化到 localStorage（刷新不丢失）
 *
 * 这让前端 mock 更接近真实后端的行为，测试更可靠。
 *
 * 【factory + model 的概念】
 * factory(models) 根据 model 定义创建数据库实例。
 * 每个 model 对应一张"表"：
 *   - db.post → 文章表
 *   - db.comment → 评论表
 *
 * model 定义的格式：
 *   - primaryKey(nanoid)：主键字段，用 nanoid 自动生成
 *   - String / Number / Array：字段类型（实际上是默认值生成函数）
 *
 * 【数据持久化方案】
 * 浏览器环境：存到 localStorage
 * Node 环境（测试）：存到文件
 * 这让开发时的数据在刷新后仍然保留，提升开发体验。
 * =============================================================================
 */
import { factory, primaryKey } from '@mswjs/data';
import { nanoid } from 'nanoid';

/**
 * 数据模型定义
 *
 * 注意：这里的 Author 信息被"拍平"了（authorName、authorAvatar、authorBio），
 * 因为 @mswjs/data 不支持嵌套对象。
 * 在 MSW handler 中会重新组装成嵌套格式（sanitizePost 函数）。
 */
const models = {
	post: {
		id: primaryKey(nanoid), // 自动生成唯一 ID
		slug: String,
		title: String,
		excerpt: String,
		content: String,
		coverImage: String,
		tags: Array, // @mswjs/data 的数组类型
		readingTime: Number,
		publishedAt: String,
		updatedAt: String,
		// 作者信息拍平存储
		authorName: String,
		authorAvatar: String,
		authorBio: String,
	},
	comment: {
		id: primaryKey(nanoid),
		postId: String, // 关联的文章 ID
		authorName: String,
		content: String,
		createdAt: String,
	},
};

/** 创建内存数据库实例 */
export const db = factory(models);

/** 模型名称联合类型 - 用于 persistDb 函数的参数类型 */
export type Model = keyof typeof models;

const dbFilePath = 'mocked-db.json';

/**
 * 从持久化存储中加载数据
 *
 * 【Node vs Browser 环境判断】
 * typeof window === 'undefined' → Node 环境（Vitest 测试）
 * 否则 → 浏览器环境
 *
 * 浏览器环境从 localStorage 读取，Node 环境从文件读取。
 */
export const loadDb = async () => {
	if (typeof window === 'undefined') {
		// Node 环境：从文件读取
		const { readFile, writeFile } = await import('fs/promises');
		try {
			const data = await readFile(dbFilePath, 'utf8');
			return JSON.parse(data);
		} catch (error: any) {
			if (error?.code === 'ENOENT') {
				// 文件不存在时创建空数据库
				const emptyDB = {};
				await writeFile(dbFilePath, JSON.stringify(emptyDB, null, 2));
				return emptyDB;
			}
			return null;
		}
	}
	// 浏览器环境：从 localStorage 读取
	return Object.assign(
		JSON.parse(window.localStorage.getItem('msw-db') || '{}'),
	);
};

/** 将数据保存到持久化存储 */
export const storeDb = async (data: string) => {
	if (typeof window === 'undefined') {
		const { writeFile } = await import('fs/promises');
		await writeFile(dbFilePath, data);
	} else {
		window.localStorage.setItem('msw-db', data);
	}
};

/**
 * 持久化指定模型的数据
 *
 * 在每次数据变更（create/update/delete）后调用，
 * 确保数据不会因为页面刷新而丢失。
 * 测试环境中跳过持久化（测试数据应该是临时的）。
 */
export const persistDb = async (model: Model) => {
	if (process.env.NODE_ENV === 'test') return;
	const data = await loadDb();
	data[model] = db[model].getAll();
	await storeDb(JSON.stringify(data));
};

/**
 * 初始化数据库：从持久化存储恢复数据
 *
 * 在 main.tsx 中 enableMocking() 时调用。
 * 遍历所有模型，将 localStorage 中保存的数据恢复到内存数据库中。
 */
export const initializeDb = async () => {
	const database = await loadDb();
	Object.entries(db).forEach(([key, model]) => {
		const dataEntries = database[key];
		if (dataEntries) {
			dataEntries?.forEach((entry: Record<string, any>) => {
				model.create(entry);
			});
		}
	});
};

/** 重置数据库（清空 localStorage） */
export const resetDb = () => {
	window.localStorage.clear();
};
