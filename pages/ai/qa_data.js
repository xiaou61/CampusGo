// QA数据集
const qaData = [
  {
    q: "什么是快速排序？",
    a: "快速排序是一种基于分治策略的排序算法。它选择一个基准值，将数组分成两个子数组，一个包含小于基准值的元素，另一个包含大于基准值的元素，然后递归地对子数组进行排序。"
  },
  {
    q: "快速排序的时间复杂度是多少？",
    a: "快速排序的时间复杂度：\n- 最优情况：O(n log n)\n- 平均情况：O(n log n)\n- 最差情况：O(n²)（当数组已经排序或逆序时）"
  },
  {
    q: "快速排序的空间复杂度是多少？",
    a: "快速排序的空间复杂度是O(log n)，主要是递归调用栈的空间消耗。"
  },
  {
    q: "快速排序是稳定的排序算法吗？",
    a: "不是，快速排序是不稳定的排序算法。"
  },
  {
    q: "快速排序的Python实现",
    a: "```python\ndef quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)\n```"
  }
];

// 计算两个字符串的相似度
function calculateSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];

  // 初始化矩阵
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // 填充矩阵
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  // 计算相似度
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
}

// 查找最相似的问题
function findSimilarQuestion(question) {
  let maxSimilarity = 0;
  let bestMatch = null;

  for (const item of qaData) {
    const similarity = calculateSimilarity(question.toLowerCase(), item.q.toLowerCase());
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      bestMatch = item;
    }
  }

  return maxSimilarity >= 0.9 ? bestMatch : null;
}

module.exports = {
  qaData,
  findSimilarQuestion
}; 