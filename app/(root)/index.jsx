  import React, { useState } from 'react'
  import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
  import { Link } from 'expo-router'
  import { Text, View, Image, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native'
  import { SignOutButton } from '@/components/SignOutButton'
  import { useTransactions } from '@/hooks/useTransactions.js'
  import { useEffect } from 'react'
  import PageLoader from '@/components/PageLoader'
  import { styles } from '@/assets/styles/home.styles'
  import { Ionicons } from "@expo/vector-icons";
  import { useRouter } from 'expo-router'
  import { BalanceCard } from '@/components/BalanceCard'
  import NoTransactionsFound from '@/components/NoTransactionsFound'
  import { TransactionItem } from '@/components/TransactionItem'

  export default function Page() {
    const { user } = useUser()
    const router = useRouter()
    if (!user?.id) return <PageLoader />;
    const { transactions, summary, isLoading, loadData, deleteTransaction } = useTransactions(user.id)
    const [refreshing, setRefreshing] = useState(false)

    const onRefresh = async () => {
      setRefreshing(true);
      await loadData();
      setRefreshing(false);
    };

    useEffect(() => {
      loadData()
    }, [loadData])

    const handleDelete = (id) => {
      Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteTransaction(id) },
      ]);
    };

    if (isLoading && !refreshing) return <PageLoader />

    console.log('User:', user.id)

    console.log('Transactions:', transactions)
    console.log('Summary:', summary)

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            {/* Left */}
            <View style={styles.headerLeft}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome,</Text>
                <Text style={styles.usernameText}>
                  {user?.emailAddresses[0]?.emailAddress.split("@")[0]}
                </Text>
              </View>
            </View>

            {/* Right */}
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create")}>
                <Ionicons name="add" size={22} color="#FFF" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              <SignOutButton />
            </View>
          </View>

          <BalanceCard summary={summary} />

          <View style={styles.transactionsHeaderContainer}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
          </View>
        </View>
        <FlatList
          style={styles.transactionsList}
          contentContainerStyle={styles.transactionsListContent}
          data={transactions}
          renderItem={({ item }) => (
            <TransactionItem item={item} onDelete={handleDelete} />
          )}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<NoTransactionsFound />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />

      </View>
    )
  }