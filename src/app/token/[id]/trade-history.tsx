'use client'

import React from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { TokenData } from '@/hooks/use-token'
import { useTokenOrderbookHistory } from '@/hooks/use-token-orderbook-history'
import { EXPLORER_URL } from '@/lib/constants'

type TradeHistoryProps = {
	token: TokenData
}

function formatRelativeTime(date: Date): string {
	const now = new Date()
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

	const intervals = [
		{ label: 'y', seconds: 31536000 },
		{ label: 'mo', seconds: 2592000 },
		{ label: 'd', seconds: 86400 },
		{ label: 'h', seconds: 3600 },
		{ label: 'm', seconds: 60 },
		{ label: 's', seconds: 1 }
	]

	for (let i = 0; i < intervals.length; i++) {
		const interval = intervals[i]
		const count = Math.floor(diffInSeconds / interval.seconds)
		if (count >= 1) {
			return `${count}${interval.label}`
		}
	}

	return 'now'
}

export function TradeHistory({ token }: TradeHistoryProps) {
	const { historyEntries, isLoading, isError } = useTokenOrderbookHistory(token)

	const formatNumber = (num: number) => {
		return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })
	}

	// Remove the getTradeColor function as we'll always use green

	// Define column widths
	const columnWidths = {
		price: '40%',
		amount: '35%',
		time: '25%'
	}

	const getBlockExplorerUrl = (txid: string | null): string => {
		if (!txid) return '#' // Return a fallback URL if txid is null
		return `${EXPLORER_URL}/tx/${txid}`
	}

	if (isLoading) {
		return <div className="text-white">Loading trade history...</div>
	}

	if (isError) {
		return <div className="text-red-500">Error loading trade history</div>
	}

	return (
		<div className="max-w-md bg-black text-white border-l w-[250px] max-h-[509px] overflow-y-auto">
			<div>
				<h3 className="px-4 py-2 text-sm font-semibold">Trade History</h3>
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent border-b">
							<TableHead
								className="text-left text-[10px] text-gray-400 font-normal h-6 sticky top-0 bg-black"
								style={{ width: columnWidths.price }}
							>
								Price(FB)
							</TableHead>
							<TableHead
								className="text-right text-[10px] text-gray-400 font-normal h-6 sticky top-0 bg-black"
								style={{ width: columnWidths.amount }}
							>
								Amount({token.symbol})
							</TableHead>
							<TableHead
								className="text-right text-[10px] text-gray-400 font-normal h-6 sticky top-0 bg-black"
								style={{ width: columnWidths.time }}
							>
								Time
							</TableHead>
						</TableRow>
					</TableHeader>
				</Table>
			</div>
			<div className="p-0 max-h-[600px] overflow-y-auto">
				<Table>
					<TableBody>
						{historyEntries.map(entry => (
							<TableRow key={entry.txid + entry.outputIndex} className="hover:bg-gray-800">
								<TableCell
									className="text-left text-[11px] py-0 text-green-500"
									style={{ width: columnWidths.price }}
								>
									{formatNumber((parseFloat(entry.price) / 1e8) * Math.pow(10, token.decimals))}
								</TableCell>
								<TableCell
									className="text-right text-[11px] text-gray-300 py-0"
									style={{ width: columnWidths.amount }}
								>
									{formatNumber(
										entry.status === 'partially_filled' && entry.fillAmount
											? parseInt(entry.fillAmount) / Math.pow(10, token.decimals)
											: parseInt(entry.tokenUtxo.state.amount) / Math.pow(10, token.decimals)
									)}
								</TableCell>
								<TableCell
									className="text-right text-[11px] text-gray-300 py-0 whitespace-nowrap"
									style={{ width: columnWidths.time }}
								>
									<a
										href={getBlockExplorerUrl(entry.spendTxid)}
										target="_blank"
										rel="noopener noreferrer"
										className="hover:underline"
									>
										{entry.spendCreatedAt
											? formatRelativeTime(new Date(entry.spendCreatedAt))
											: 'Pending'}
									</a>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
