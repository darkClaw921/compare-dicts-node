import type { IExecuteFunctions } from 'n8n-core';
import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class CompareDictionaries implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Compare Dictionaries',
		name: 'compareDictionaries',
		icon: 'file:compare.svg',
		group: ['transform'],
		version: 1,
		description: 'Сравнивает два словаря и возвращает различия',
		defaults: {
			name: 'Compare Dictionaries',
		},
		inputs: ['main', 'main'],
		inputNames: ['Dictionary 1', 'Dictionary 2'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Compare Mode',
				name: 'compareMode',
				type: 'options',
				options: [
					{
						name: 'Use Input Connections',
						value: 'connections',
						description: 'Использовать данные из входных соединений',
					},
					{
						name: 'Use Manual Input',
						value: 'manual',
						description: 'Использовать ручной ввод данных',
					},
				],
				default: 'connections',
				description: 'Режим сравнения словарей',
			},
			{
				displayName: 'First Dictionary',
				name: 'firstDictionary',
				type: 'string',
				typeOptions: {
					rows: 4,
					editor: 'json',
				},
				default: '',
				placeholder: '{"ID": "1", "TITLE": "Лид #1", ...}',
				description: 'Первый словарь для сравнения',
				displayOptions: {
					show: {
						compareMode: ['manual'],
					},
				},
				noDataExpression: true,
			},
			{
				displayName: 'Second Dictionary',
				name: 'secondDictionary',
				type: 'string',
				typeOptions: {
					rows: 4,
					editor: 'json',
				},
				default: '',
				placeholder: '{"ID": "1", "TITLE": "Лид #2", ...}',
				description: 'Второй словарь для сравнения',
				displayOptions: {
					show: {
						compareMode: ['manual'],
					},
				},
				noDataExpression: true,
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Ignore Null Values',
						name: 'ignoreNull',
						type: 'boolean',
						default: true,
						description: 'Игнорировать null значения при сравнении',
					},
					{
						displayName: 'Ignore Empty Strings',
						name: 'ignoreEmptyStrings',
						type: 'boolean',
						default: true,
						description: 'Игнорировать пустые строки при сравнении',
					},
					{
						displayName: 'Continue On Error',
						name: 'continueOnError',
						type: 'boolean',
						default: false,
						description: 'Продолжить выполнение даже при возникновении ошибок',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		try {
			const compareMode = this.getNodeParameter('compareMode', 0) as string;
			const options = this.getNodeParameter('options', 0) as IDataObject;
			
			let firstDictionary: IDataObject;
			let secondDictionary: IDataObject;

			if (compareMode === 'connections') {
				// Получаем данные из входных соединений
				const inputs = this.getInputData();
				const input2 = this.getInputData(1);

				if (!inputs[0] || !input2[0]) {
					if (options.continueOnError) {
						return [this.helpers.returnJsonArray([{}])];
					}
					throw new NodeOperationError(this.getNode(), 'Необходимы данные от обоих входных соединений');
				}

				// Если входные данные содержат поле result, используем его
				firstDictionary = (inputs[0].json.result as IDataObject) || inputs[0].json;
				secondDictionary = (input2[0].json.result as IDataObject) || input2[0].json;
			} else {
				// Получаем данные из ручного ввода
				const firstDictionaryStr = this.getNodeParameter('firstDictionary', 0) as string;
				const secondDictionaryStr = this.getNodeParameter('secondDictionary', 0) as string;

				try {
					firstDictionary = firstDictionaryStr ? JSON.parse(firstDictionaryStr) : {};
					secondDictionary = secondDictionaryStr ? JSON.parse(secondDictionaryStr) : {};
				} catch (error) {
					if (options.continueOnError) {
						return [this.helpers.returnJsonArray([{}])];
					}
					throw new NodeOperationError(this.getNode(), 'Неверный формат JSON в одном из словарей');
				}
			}

			const result: IDataObject = {};
			const allKeys = new Set([...Object.keys(firstDictionary), ...Object.keys(secondDictionary)]);

			for (const key of allKeys) {
				const firstValue = firstDictionary[key];
				const secondValue = secondDictionary[key];

				// Пропускаем, если значения равны
				if (firstValue === secondValue) continue;

				// Проверяем опции игнорирования
				if (options.ignoreNull && (firstValue === null || secondValue === null)) continue;
				if (options.ignoreEmptyStrings && (firstValue === '' || secondValue === '')) continue;

				// Если значения различаются и ключ есть во втором словаре
				if (key in firstDictionary && key in secondDictionary && firstValue !== secondValue) {
					result[key] = secondValue;
				}
			}

			// Возвращаем только различающиеся поля
			return [this.helpers.returnJsonArray([result])];
		} catch (error) {
			const options = this.getNodeParameter('options', 0) as IDataObject;
			if (options.continueOnError) {
				return [this.helpers.returnJsonArray([{}])];
			}
			if (error instanceof Error) {
				throw new NodeOperationError(this.getNode(), `Ошибка при сравнении словарей: ${error.message}`);
			}
			throw error;
		}
	}
} 