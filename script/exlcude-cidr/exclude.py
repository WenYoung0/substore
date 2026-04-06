#!/usr/bin/env python3
"""
cidr_not.py — CIDR 取反工具
用法:
    python3 cidr_not.py -i input.txt
    python3 cidr_not.py -i input.txt --ipv4
    python3 cidr_not.py -i input.txt --ipv6
    cat input.txt | python3 cidr_not.py
"""

import ipaddress
import argparse
import sys


def subtract_cidrs(universe: str, excludes: list) -> list:
    remaining = [ipaddress.ip_network(universe)]
    for excl in excludes:
        next_rem = []
        for net in remaining:
            if not net.overlaps(excl):
                next_rem.append(net)
            else:
                next_rem.extend(net.address_exclude(excl))
        remaining = next_rem
    return sorted(remaining)


def parse_cidrs(lines: list) -> tuple[list, list]:
    """解析输入行，返回 (ipv4列表, ipv6列表)，忽略空行和注释。"""
    v4, v6 = [], []
    for lineno, raw in enumerate(lines, 1):
        line = raw.strip()
        if not line or line.startswith('#'):
            continue
        try:
            net = ipaddress.ip_network(line, strict=False)
            (v4 if net.version == 4 else v6).append(net)
        except ValueError:
            print(f"[警告] 第 {lineno} 行无效，已跳过: {line!r}", file=sys.stderr)
    return v4, v6


def main():
    parser = argparse.ArgumentParser(
        description="输入一组 CIDR，输出其在全地址空间中的补集（取反）。"
    )
    parser.add_argument("-i", "--input", metavar="FILE",
                        help="输入文件（每行一个 CIDR），不指定则读 stdin")
    parser.add_argument("--ipv4", action="store_true", help="只处理 IPv4")
    parser.add_argument("--ipv6", action="store_true", help="只处理 IPv6")
    parser.add_argument("--universe4", default="0.0.0.0/0",
                        metavar="CIDR", help="IPv4 全集，默认 0.0.0.0/0")
    parser.add_argument("--universe6", default="::/0",
                        metavar="CIDR", help="IPv6 全集，默认 ::/0")
    args = parser.parse_args()

    # 读取输入
    if args.input:
        try:
            with open(args.input) as f:
                lines = f.readlines()
        except OSError as e:
            print(f"[错误] 无法打开文件: {e}", file=sys.stderr)
            sys.exit(1)
    elif not sys.stdin.isatty():
        lines = sys.stdin.readlines()
    else:
        parser.print_help()
        sys.exit(0)

    v4_excl, v6_excl = parse_cidrs(lines)

    show_v4 = args.ipv4 or not args.ipv6
    show_v6 = args.ipv6 or not args.ipv4

    results = []

    if show_v4 and v4_excl:
        results += subtract_cidrs(args.universe4, v4_excl)
    elif show_v4 and not v4_excl:
        # 没有 IPv4 输入，原样输出全集
        results.append(ipaddress.ip_network(args.universe4))

    if show_v6 and v6_excl:
        results += subtract_cidrs(args.universe6, v6_excl)
    elif show_v6 and not v6_excl:
        results.append(ipaddress.ip_network(args.universe6))

    print(",".join([ "\"" + str(v) + "\"" for v in results]))


if __name__ == "__main__":
    main()